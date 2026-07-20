// ============================================
// Bags Bro! Reply Engine
// Monitors target timelines, scores relevance,
// generates on-brand replies, queues for approval
// or auto-fires based on confidence threshold.
// ============================================

import Anthropic from '@anthropic-ai/sdk';
import { getDb } from '../../db/mongodb';
import { getTwitterClient } from './twitterClient';
import { TweetV2 } from 'twitter-api-v2';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PERSONA = `You are BagsBro, the chaotic degen voice of Bags Bro! NFT project.

Your replies are:
- SHORT (5-25 words usually, 35 absolute max)
- Natural — sounds like a real crypto degen, NOT a bot
- Occasionally funny, occasionally just agreeable
- Use Bagaverse lingo sparingly (max 1 term, often none)
- NO hashtags, NO @ mentions, NO links
- NO "gm", "ser", "fren", "LFG" — overused

Good replies: "the bags predicted this tbh" | "certified bagger behavior" | "this is just bagonomics at work"
Bad replies: "lol bag theory confirmed 🛍️ wagmi fren!! so based ser"

If you can't think of a good reply that sounds natural, respond with exactly: SKIP`;

interface TargetAccount {
  _id: string;
  handle: string;
  tier: 'S' | 'A' | 'B' | 'C';
  followerCount: number;
  lastReplied: Date | null;
  lastChecked: Date | null;
  totalReplies: number;
  active: boolean;
  autoApprove: boolean;  // skip approval queue for this target
  autoApproveThreshold: number; // relevance score 0-1
}

interface PendingReply {
  targetHandle: string;
  targetTweetId: string;
  targetText: string;
  suggestedReply: string;
  relevanceScore: number;
  tier: string;
  status: 'pending' | 'approved' | 'sent' | 'skipped';
  createdAt: Date;
}

// ---- Cooldown checks ----

async function canReplyToTarget(handle: string, tier: string): Promise<boolean> {
  const db = await getDb();
  const now = new Date();

  // Cooldown by tier
  const cooldownHours: Record<string, number> = {
    S: 8, A: 4, B: 2, C: 12,
  };
  const cooldown = (cooldownHours[tier] ?? 4) * 60 * 60 * 1000;
  const cutoff = new Date(now.getTime() - cooldown);

  const recentReply = await db.collection('replies').findOne({
    targetHandle: handle,
    status: 'sent',
    sentAt: { $gte: cutoff },
  });

  if (recentReply) {
    console.log(`[ReplyEngine] Cooldown active for @${handle}`);
    return false;
  }

  // Check daily reply limit
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = await db.collection('replies').countDocuments({
    status: 'sent',
    sentAt: { $gte: today },
  });

  if (todayCount >= 20) {
    console.log('[ReplyEngine] Daily reply limit reached');
    return false;
  }

  return true;
}

// ---- Relevance scoring ----

async function scoreRelevance(tweetText: string): Promise<number> {
  // Fast keyword-based pre-filter before hitting Claude
  const keywords = [
    'crypto', 'nft', 'market', 'bags', 'trading', 'eth', 'btc', 'sol',
    'degen', 'defi', 'token', 'price', 'portfolio', 'rug', 'pump', 'dump',
    'money', 'invest', 'broke', 'rich', 'wagmi', 'ngmi', 'bull', 'bear',
    'inflation', 'economy', 'grind', 'hustle', 'startup', 'founder',
  ];

  const lower = tweetText.toLowerCase();
  const matchCount = keywords.filter(k => lower.includes(k)).length;

  // Base score from keyword density
  let score = Math.min(matchCount / 3, 0.6);

  // Length penalty — very short tweets are hard to reply to naturally
  if (tweetText.length < 30) score *= 0.7;

  // Boost for question format
  if (tweetText.includes('?')) score = Math.min(score + 0.15, 0.9);

  return score;
}

// ---- Reply generation ----

async function generateReply(
  tweetText: string,
  authorHandle: string
): Promise<string | null> {
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 60,
    messages: [{
      role: 'user',
      content: `${PERSONA}

Tweet by @${authorHandle}: "${tweetText}"

Write your reply. Remember: SHORT, natural, could be from a real person.
Respond with ONLY the reply text, or SKIP.`,
    }],
  });

  const reply = (msg.content[0] as any).text.trim();
  if (reply === 'SKIP' || reply.length > 280) return null;
  return reply;
}

// ---- Already replied check ----

async function alreadyRepliedToTweet(tweetId: string): Promise<boolean> {
  const db = await getDb();
  const existing = await db.collection('replies').findOne({
    targetTweetId: tweetId,
    status: { $in: ['sent', 'approved', 'pending'] },
  });
  return !!existing;
}

// ---- Process a single target ----

async function processTarget(target: TargetAccount): Promise<void> {
  const twitter = getTwitterClient();
  const db = await getDb();

  console.log(`[ReplyEngine] Checking @${target.handle} (Tier ${target.tier})`);

  const tweets = await twitter.fetchUserTimeline(target.handle, 5);
  if (tweets.length === 0) return;

  // Update last checked
  await db.collection('targets').updateOne(
    { handle: target.handle },
    { $set: { lastChecked: new Date() } }
  );

  for (const tweet of tweets) {
    if (!tweet.text) continue;

    // Skip retweets
    if (tweet.text.startsWith('RT @')) continue;

    // Skip if already processed
    if (await alreadyRepliedToTweet(tweet.id)) continue;

    // Score relevance
    const score = await scoreRelevance(tweet.text);
    if (score < 0.35) {
      console.log(`[ReplyEngine] Low relevance (${score.toFixed(2)}) for tweet ${tweet.id}, skipping`);
      continue;
    }

    // Check cooldown
    if (!(await canReplyToTarget(target.handle, target.tier))) continue;

    // Generate reply
    const reply = await generateReply(tweet.text, target.handle);
    if (!reply) {
      console.log(`[ReplyEngine] No good reply generated for tweet ${tweet.id}`);
      continue;
    }

    const pending: PendingReply = {
      targetHandle: target.handle,
      targetTweetId: tweet.id,
      targetText: tweet.text,
      suggestedReply: reply,
      relevanceScore: score,
      tier: target.tier,
      status: 'pending',
      createdAt: new Date(),
    };

    await db.collection('replies').insertOne(pending);
    console.log(`[ReplyEngine] Queued reply for @${target.handle}: "${reply.slice(0, 50)}"`);

    // Auto-approve if above threshold and target is configured for it
    const threshold = target.autoApproveThreshold ?? 0.75;
    if (target.autoApprove && score >= threshold) {
      await sendReply(tweet.id, reply, target.handle);
    }

    // Only queue one reply per target per run
    break;
  }
}

// ---- Send an approved reply ----

export async function sendReply(
  tweetId: string,
  replyText: string,
  targetHandle: string
): Promise<boolean> {
  const twitter = getTwitterClient();
  const db = await getDb();

  const tweetResultId = await twitter.reply(replyText, tweetId);

  const status = tweetResultId ? 'sent' : 'failed';
  await db.collection('replies').updateOne(
    { targetTweetId: tweetId, targetHandle },
    {
      $set: {
        status,
        sentAt: new Date(),
        resultTweetId: tweetResultId,
      },
    }
  );

  if (tweetResultId) {
    await db.collection('targets').updateOne(
      { handle: targetHandle },
      {
        $set: { lastReplied: new Date() },
        $inc: { totalReplies: 1 },
      }
    );
  }

  return !!tweetResultId;
}

// ---- Main reply cycle ----

export async function runReplyEngine(): Promise<void> {
  const db = await getDb();

  const targets = await db.collection<TargetAccount>('targets')
    .find({ active: true })
    .sort({ tier: 1 }) // S-tier first
    .toArray();

  if (targets.length === 0) {
    console.log('[ReplyEngine] No active targets configured');
    return;
  }

  console.log(`[ReplyEngine] Processing ${targets.length} targets`);

  // Shuffle within each tier to vary which accounts we check first
  const shuffled = targets.sort(() => Math.random() - 0.5);

  for (const target of shuffled) {
    try {
      await processTarget(target);

      // Random delay between targets (1-4 minutes)
      const delay = Math.floor(Math.random() * 3 * 60 * 1000) + 60 * 1000;
      await new Promise(r => setTimeout(r, delay));
    } catch (err: any) {
      console.error(`[ReplyEngine] Error processing @${target.handle}:`, err.message);
    }
  }

  console.log('[ReplyEngine] Cycle complete');
}

// ---- Approve pending replies from admin dashboard ----

export async function approvePendingReply(replyId: string): Promise<boolean> {
  const db = await getDb();
  const pending = await db.collection<PendingReply>('replies').findOne({
    _id: replyId as any,
    status: 'pending',
  });

  if (!pending) return false;
  return sendReply(pending.targetTweetId, pending.suggestedReply, pending.targetHandle);
}

export async function skipPendingReply(replyId: string): Promise<void> {
  const db = await getDb();
  await db.collection('replies').updateOne(
    { _id: replyId as any },
    { $set: { status: 'skipped', skippedAt: new Date() } }
  );
}

export async function getPendingReplies(): Promise<PendingReply[]> {
  const db = await getDb();
  return db.collection<PendingReply>('replies')
    .find({ status: 'pending' })
    .sort({ relevanceScore: -1, createdAt: -1 })
    .limit(20)
    .toArray();
}
