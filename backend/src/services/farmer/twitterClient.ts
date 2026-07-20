// ============================================
// Bags Bro! Twitter Client
// Wraps twitter-api-v2 with rate limiting,
// anti-detection delays, and activity logging
// ============================================

import { TwitterApi, TwitterApiReadWrite, TweetV2, UserV2 } from 'twitter-api-v2';
import { getDb } from '../../db/mongodb';

const SAFETY_LIMITS = {
  postsPerDay: 5,
  repliesPerDay: 20,
  likesPerDay: 80,
  followsPerDay: 3,
  minMsBetweenActions: 3 * 60 * 1000,   // 3 min minimum
  maxActionsPerHour: 12,
};

// Human-like delay before any action (simulates typing/thinking)
function humanDelay(minMs = 8000, maxMs = 45000): Promise<void> {
  const ms = Math.floor(Math.random() * (maxMs - minMs)) + minMs;
  return new Promise(resolve => setTimeout(resolve, ms));
}

function jitter(ms: number, pct = 0.2): number {
  return ms + Math.floor((Math.random() * 2 - 1) * ms * pct);
}

export class BagsBroTwitterClient {
  private client: TwitterApi;
  private rwClient: TwitterApiReadWrite;
  private lastActionAt = 0;
  private actionsThisHour = 0;
  private hourResetAt = Date.now();

  constructor() {
    this.client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
    });
    this.rwClient = this.client.readWrite;
  }

  // ---- Rate limit enforcement ----

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();

    // Reset hourly counter
    if (now - this.hourResetAt > 3600 * 1000) {
      this.actionsThisHour = 0;
      this.hourResetAt = now;
    }

    if (this.actionsThisHour >= SAFETY_LIMITS.maxActionsPerHour) {
      const waitMs = jitter(this.hourResetAt + 3600 * 1000 - now);
      console.log(`[Twitter] Hourly limit reached, waiting ${Math.round(waitMs / 60000)}min`);
      await new Promise(r => setTimeout(r, waitMs));
      this.actionsThisHour = 0;
      this.hourResetAt = Date.now();
    }

    const msSinceLast = now - this.lastActionAt;
    if (msSinceLast < SAFETY_LIMITS.minMsBetweenActions) {
      await new Promise(r => setTimeout(r, SAFETY_LIMITS.minMsBetweenActions - msSinceLast));
    }

    this.lastActionAt = Date.now();
    this.actionsThisHour++;
  }

  private async checkDailyLimit(action: 'post' | 'reply' | 'like' | 'follow'): Promise<boolean> {
    const db = await getDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await db.collection('activity_log').countDocuments({
      action,
      success: true,
      timestamp: { $gte: today },
    });

    const limits: Record<string, number> = {
      post: SAFETY_LIMITS.postsPerDay,
      reply: SAFETY_LIMITS.repliesPerDay,
      like: SAFETY_LIMITS.likesPerDay,
      follow: SAFETY_LIMITS.followsPerDay,
    };

    if (count >= limits[action]) {
      console.log(`[Twitter] Daily ${action} limit reached (${count}/${limits[action]})`);
      return false;
    }
    return true;
  }

  private async logActivity(
    action: string,
    twitterId: string | null,
    success: boolean,
    error?: string,
    meta?: Record<string, unknown>
  ): Promise<void> {
    const db = await getDb();
    await db.collection('activity_log').insertOne({
      action,
      twitterId,
      success,
      error: error ?? null,
      meta: meta ?? null,
      timestamp: new Date(),
    });
  }

  // ---- Core actions ----

  async tweet(text: string, mediaId?: string): Promise<string | null> {
    if (!(await this.checkDailyLimit('post'))) return null;

    await humanDelay(5000, 20000);
    await this.enforceRateLimit();

    try {
      const payload: { text: string; media?: { media_ids: [string] } } = { text };
      if (mediaId) payload.media = { media_ids: [mediaId] };

      const result = await this.rwClient.v2.tweet(payload);
      const tweetId = result.data.id;

      await this.logActivity('post', tweetId, true, undefined, { text: text.slice(0, 100) });
      console.log(`[Twitter] Tweeted: ${tweetId} — "${text.slice(0, 60)}..."`);
      return tweetId;
    } catch (err: any) {
      await this.logActivity('post', null, false, err.message);
      console.error('[Twitter] Tweet failed:', err.message);
      return null;
    }
  }

  async reply(text: string, replyToTweetId: string): Promise<string | null> {
    if (!(await this.checkDailyLimit('reply'))) return null;

    await humanDelay(jitter(8 * 60 * 1000), jitter(25 * 60 * 1000)); // 8-25 min delay
    await this.enforceRateLimit();

    try {
      const result = await this.rwClient.v2.tweet({
        text,
        reply: { in_reply_to_tweet_id: replyToTweetId },
      });
      const tweetId = result.data.id;

      await this.logActivity('reply', tweetId, true, undefined, {
        replyTo: replyToTweetId,
        text: text.slice(0, 100),
      });
      console.log(`[Twitter] Replied to ${replyToTweetId}: "${text.slice(0, 50)}..."`);
      return tweetId;
    } catch (err: any) {
      await this.logActivity('reply', null, false, err.message);
      console.error('[Twitter] Reply failed:', err.message);
      return null;
    }
  }

  async like(tweetId: string): Promise<boolean> {
    if (!(await this.checkDailyLimit('like'))) return false;

    await humanDelay(2000, 8000);
    await this.enforceRateLimit();

    try {
      const me = await this.rwClient.v2.me();
      await this.rwClient.v2.like(me.data.id, tweetId);
      await this.logActivity('like', tweetId, true);
      return true;
    } catch (err: any) {
      await this.logActivity('like', tweetId, false, err.message);
      return false;
    }
  }

  async uploadMedia(imageBuffer: Buffer, mimeType: string): Promise<string | null> {
    try {
      const mediaId = await this.client.v1.uploadMedia(imageBuffer, { mimeType });
      console.log(`[Twitter] Media uploaded: ${mediaId}`);
      return mediaId;
    } catch (err: any) {
      console.error('[Twitter] Media upload failed:', err.message);
      return null;
    }
  }

  async fetchUserTimeline(username: string, maxResults = 10): Promise<TweetV2[]> {
    try {
      const user = await this.rwClient.v2.userByUsername(username);
      if (!user.data) return [];

      const timeline = await this.rwClient.v2.userTimeline(user.data.id, {
        max_results: maxResults,
        'tweet.fields': ['created_at', 'public_metrics', 'text'],
        exclude: ['retweets', 'replies'],
      });

      return timeline.data.data ?? [];
    } catch (err: any) {
      console.error(`[Twitter] Failed to fetch timeline for @${username}:`, err.message);
      return [];
    }
  }

  async fetchMentions(sinceId?: string): Promise<TweetV2[]> {
    try {
      const me = await this.rwClient.v2.me();
      const mentions = await this.rwClient.v2.userMentionTimeline(me.data.id, {
        max_results: 20,
        since_id: sinceId,
        'tweet.fields': ['created_at', 'author_id', 'text', 'public_metrics'],
      });
      return mentions.data.data ?? [];
    } catch (err: any) {
      console.error('[Twitter] Failed to fetch mentions:', err.message);
      return [];
    }
  }

  async getMyUserId(): Promise<string | null> {
    try {
      const me = await this.rwClient.v2.me();
      return me.data.id;
    } catch {
      return null;
    }
  }
}

// Singleton
let _client: BagsBroTwitterClient | null = null;
export function getTwitterClient(): BagsBroTwitterClient {
  if (!_client) _client = new BagsBroTwitterClient();
  return _client;
}
