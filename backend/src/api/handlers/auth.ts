// src/api/handlers/auth.ts
// Twitter OAuth 2.0 — matches Soniqute/Grizl pattern
// PKCE stored in memory + signed JWT cookie fallback
// Redirects to frontend with JWT token in URL params

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { getDb } from '../../db/mongodb';

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://bagsbro.io';
const BACKEND_URL = process.env.BACKEND_URL || 'https://api.bagsbro.io';
const X_CLIENT_ID = process.env.TWITTER_CLIENT_ID!;
const X_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET!;
const JWT_SECRET = process.env.SESSION_SECRET!;

// ── PKCE helpers ──────────────────────────────────────────────────────────────
const generateCodeVerifier = () => crypto.randomBytes(32).toString('base64url');
const generateCodeChallenge = (v: string) =>
  crypto.createHash('sha256').update(v).digest('base64url');
const generateState = () => crypto.randomBytes(16).toString('hex');

// ── In-memory PKCE store (fallback: signed cookie) ───────────────────────────
const oauthStore = new Map<string, { codeVerifier: string; timestamp: number }>();

const OAUTH_COOKIE = 'oauth_pkce';
const THROTTLE_COOKIE = 'oauth_recent';

function signShort(data: object) {
  return jwt.sign(data, JWT_SECRET, { expiresIn: '15m' });
}
function tryVerify(token: string): any {
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}
function isThrottled(req: FastifyRequest): boolean {
  return !!(req.cookies as any)?.[THROTTLE_COOKIE];
}

// ── Token exchange with one 429 retry ────────────────────────────────────────
async function exchangeWithRetry(form: URLSearchParams, headers: Record<string, string>) {
  const attempt = async () => {
    const res = await fetch('https://api.x.com/2/oauth2/token', {
      method: 'POST',
      headers,
      body: form,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const err: any = new Error('Token exchange failed');
      err.status = res.status;
      err.data = data;
      err.responseHeaders = Object.fromEntries(res.headers.entries());
      throw err;
    }
    return res.json();
  };

  try {
    return await attempt();
  } catch (err: any) {
    if (err.status !== 429) throw err;
    const retryAfter = Number(err.responseHeaders?.['retry-after']) || 0;
    const resetUnix = Number(err.responseHeaders?.['x-rate-limit-reset']) || 0;
    let waitMs = 90_000;
    if (retryAfter > 0) waitMs = retryAfter * 1000;
    else if (resetUnix > 0) {
      const delta = resetUnix * 1000 - Date.now();
      if (delta > 0 && delta < 3 * 60_000) waitMs = delta;
    }
    console.warn(`[auth] 429 from X, retrying after ${Math.round(waitMs / 1000)}s`);
    await new Promise(r => setTimeout(r, Math.min(waitMs, 120_000)));
    return attempt();
  }
}

function mapErrorToCode(err: any): string {
  if (!err.status) return 'transport_error';
  if (err.status === 429) {
    const retryAfter = err.responseHeaders?.['retry-after'];
    const wait = Number.isFinite(+retryAfter) ? Math.max(10, Math.min(+retryAfter, 120)) : 60;
    return `rate_limited_${wait}s`;
  }
  const desc = err.data?.error_description || err.data?.error || '';
  if (desc.includes('invalid_grant')) return 'invalid_grant';
  if (desc.includes('invalid_client')) return 'invalid_client';
  if (desc.includes('access_denied')) return 'access_denied';
  if (desc) return desc.replace(/\s+/g, '_').toLowerCase();
  return `http_${err.status}`;
}

// ── Dedupe: prevent double exchange of same code ──────────────────────────────
const usedCodes = new Set<string>();

export async function registerAuthRoutes(app: FastifyInstance): Promise<void> {

  // Step 1: Redirect to Twitter OAuth
  app.get('/auth/twitter/authorize-redirect', async (req: FastifyRequest, reply: FastifyReply) => {
    if (isThrottled(req)) {
      return reply.redirect(`${FRONTEND_URL}/admin/login?error=please_wait`);
    }

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();

    oauthStore.set(state, { codeVerifier, timestamp: Date.now() });

    // Fallback cookie in case memory store is lost (multi-instance)
    const packed = signShort({ state, codeVerifier });
    reply.setCookie(OAUTH_COOKIE, packed, {
      httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 15 * 60,
    });

    // Throttle cookie (30s quiet period)
    reply.setCookie(THROTTLE_COOKIE, Date.now().toString(), {
      httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 30,
    });

    const authUrl = new URL('https://x.com/i/oauth2/authorize');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', X_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', `${BACKEND_URL}/auth/twitter/callback`);
    authUrl.searchParams.append('scope', 'tweet.read users.read offline.access');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');

    return reply.redirect(authUrl.toString());
  });

  // Step 2: Twitter callback
  app.get('/auth/twitter/callback', async (
    req: FastifyRequest<{ Querystring: { code?: string; state?: string; error?: string } }>,
    reply: FastifyReply
  ) => {
    const { code, state, error } = req.query;

    if (error) {
      return reply.redirect(`${FRONTEND_URL}/admin/login?error=${encodeURIComponent(error)}`);
    }
    if (!code || !state) {
      return reply.redirect(`${FRONTEND_URL}/admin/login?error=missing_parameters`);
    }

    // Dedupe
    if (usedCodes.has(code)) {
      return reply.redirect(`${FRONTEND_URL}/admin/login?error=code_already_used`);
    }
    usedCodes.add(code);
    setTimeout(() => usedCodes.delete(code), 5 * 60 * 1000);

    // Recover PKCE — memory first, cookie fallback
    let codeVerifier: string | null = null;
    const memEntry = oauthStore.get(state);
    if (memEntry) {
      codeVerifier = memEntry.codeVerifier;
      oauthStore.delete(state);
    } else {
      const packed = (req.cookies as any)?.[OAUTH_COOKIE];
      const decoded = packed ? tryVerify(packed) : null;
      if (decoded?.state === state) {
        codeVerifier = decoded.codeVerifier;
      }
    }

    if (!codeVerifier) {
      return reply.redirect(`${FRONTEND_URL}/admin/login?error=invalid_state`);
    }

    // Clean old memory entries
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    for (const [k, v] of oauthStore) {
      if (v.timestamp < tenMinutesAgo) oauthStore.delete(k);
    }

    // Exchange code for token
    let tokenData: any;
    try {
      const form = new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: X_CLIENT_ID,
        redirect_uri: `${BACKEND_URL}/auth/twitter/callback`,
        code_verifier: codeVerifier,
      });
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${X_CLIENT_ID}:${X_CLIENT_SECRET}`).toString('base64')}`,
      };
      tokenData = await exchangeWithRetry(form, headers);
    } catch (err: any) {
      console.error('[auth] token exchange failed', err);
      return reply.redirect(`${FRONTEND_URL}/admin/login?error=${encodeURIComponent(mapErrorToCode(err))}`);
    }

    const accessToken = tokenData?.access_token;
    if (!accessToken) {
      return reply.redirect(`${FRONTEND_URL}/admin/login?error=invalid_token_response`);
    }

    // Fetch Twitter user
    let twitterUser: any;
    try {
      const userRes = await fetch(
        'https://api.x.com/2/users/me?user.fields=id,name,username,profile_image_url',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const userData = await userRes.json() as any;
      twitterUser = userData?.data;
    } catch (err) {
      console.error('[auth] failed to fetch Twitter user', err);
      return reply.redirect(`${FRONTEND_URL}/admin/login?error=user_fetch_failed`);
    }

    const handle = twitterUser?.username?.toLowerCase();
    if (!handle) {
      return reply.redirect(`${FRONTEND_URL}/admin/login?error=no_username`);
    }

    // Check admin status in MongoDB
    const db = await getDb();
    const adminDoc = await db.collection('admins').findOne({
      twitterHandle: handle,
      active: true,
    });

    if (!adminDoc) {
      console.warn(`[auth] non-admin login attempt: @${handle}`);
      return reply.redirect(`${FRONTEND_URL}/admin/login?error=not_admin`);
    }

    // Clear PKCE cookies
    reply.clearCookie(OAUTH_COOKIE, { path: '/' });
    reply.clearCookie(THROTTLE_COOKIE, { path: '/' });

    // Sign JWT
    const token = jwt.sign({
      twitterHandle: handle,
      name: twitterUser.name,
      profileImage: twitterUser.profile_image_url,
      isAdmin: true,
    }, JWT_SECRET, { expiresIn: '7d' });

    // Redirect to frontend with token in URL (matches Soniqute pattern)
    const redirectUrl = new URL(`${FRONTEND_URL}/admin/login`);
    redirectUrl.searchParams.append('success', 'true');
    redirectUrl.searchParams.append('token', token);
    redirectUrl.searchParams.append('user', encodeURIComponent(JSON.stringify({
      twitterHandle: handle,
      name: twitterUser.name,
      profileImage: twitterUser.profile_image_url,
      isAdmin: true,
    })));

    return reply.redirect(redirectUrl.toString());
  });

  // Verify JWT (frontend calls this to check auth state)
  app.get('/auth/me', async (req: FastifyRequest, reply: FastifyReply) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return reply.status(401).send({ authenticated: false });
    const decoded = tryVerify(token);
    if (!decoded) return reply.status(401).send({ authenticated: false });
    return { authenticated: true, user: decoded };
  });
}
