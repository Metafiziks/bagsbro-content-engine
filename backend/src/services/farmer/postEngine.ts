// ============================================
// Bags Bro! Post Engine
// Generates and publishes scheduled posts.
// Content types: hot_take, shitpost, nft_image, gif, mp4
// All filtered through the Bagaverse voice.
// ============================================

import Anthropic from '@anthropic-ai/sdk';
import { getDb } from '../../db/mongodb';
import { getTwitterClient } from './twitterClient';
import { pickTrendForPost, TrendingTopic } from './trendingEngine';
import { generateAndAnimate } from './videoEngine';
import {
  buildHotTakeContext,
  buildShitpostContext,
  buildTrendingContext,
  buildNftCaptionContext,
  buildMp4CaptionContext,
  markTopicUsed,
  PostType,
} from './contextEngine';
import fetch from 'node-fetch';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface MediaItem {
  _id: string;
  type: 'gif' | 'ipfs_image' | 'mp4';
  url: string;
  name?: string;
  tags: string[];
  usageCount: number;
  lastUsed: Date | null;
  cooldownHours: number;
}

// ── Sanitize generated content ────────────────────────────────────────────────

function sanitize(text: string): string {
  return text
    .replace(/\s*—\s*/g, ', ')
    .replace(/\s*–\s*/g, ', ')
    .replace(/…/g, '...')
    .trim();
}

// ── Content generation ────────────────────────────────────────────────────────

async function generateHotTake(gifName?: string): Promise<{ content: string; topic: string }> {
  const { prompt, topic } = await buildHotTakeContext(gifName);
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 100,
    messages: [{ role: 'user', content: prompt }],
  });
  await markTopicUsed(topic);
  return { content: sanitize((msg.content[0] as any).text.trim()), topic };
}

async function generateShitpost(): Promise<string> {
  const prompt = await buildShitpostContext();
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 100,
    messages: [{ role: 'user', content: prompt }],
  });
  return sanitize((msg.content[0] as any).text.trim());
}

async function generateNftCaption(): Promise<string> {
  const prompt = await buildNftCaptionContext();
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 80,
    messages: [{ role: 'user', content: prompt }],
  });
  return sanitize((msg.content[0] as any).text.trim());
}

async function generateTrendingPost(trend: TrendingTopic): Promise<string> {
  const prompt = await buildTrendingContext(
    trend.name,
    trend.category,
    trend.newsContext.map(n => ({ headline: n.headline, source: n.source }))
  );
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 120,
    messages: [{ role: 'user', content: prompt }],
  });
  return sanitize((msg.content[0] as any).text.trim());
}

async function generateMp4Caption(mediaName?: string): Promise<string> {
  const prompt = await buildMp4CaptionContext(mediaName);
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 80,
    messages: [{ role: 'user', content: prompt }],
  });
  return sanitize((msg.content[0] as any).text.trim());
}

// ---- Media selection ----

async function selectMedia(type: 'gif' | 'ipfs_image' | 'mp4', mood?: string, content?: string): Promise<MediaItem | null> {
  const db = await getDb();
  const cooldownCutoff = new Date(Date.now() - 72 * 60 * 60 * 1000);

  const baseQuery: Record<string, unknown> = {
    type,
    active: true,
    $or: [
      { lastUsed: null },
      { lastUsed: { $lt: cooldownCutoff } },
    ],
  };

  // For GIFs: try to match a lingo term found in the post content first
  if (type === 'gif' && content) {
    const lingo = await db.collection('lingo').find({ active: true }).toArray();
    const matchedTerm = lingo.find(e =>
      content.toLowerCase().includes(e.term.toLowerCase())
    );
    if (matchedTerm) {
      const term = matchedTerm.term.toLowerCase();
      const lingoMatch = await db.collection<MediaItem>('media_library').findOne({
        ...baseQuery,
        $or: [
          { tags: { $in: [term, matchedTerm.term] } },
          { name: { $regex: new RegExp(term, 'i') } },
        ],
      });
      if (lingoMatch) {
        console.log(`[PostEngine] Lingo-matched GIF "${lingoMatch.name}" for "${matchedTerm.term}"`);
        return lingoMatch;
      }
    }
  }

  if (mood) baseQuery.tags = mood;

  const candidates = await db.collection<MediaItem>('media_library')
    .find(baseQuery)
    .sort({ usageCount: 1, lastUsed: 1 })
    .limit(10)
    .toArray();

  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * Math.min(candidates.length, 5))];
}

async function markMediaUsed(mediaId: string): Promise<void> {
  const db = await getDb();
  await db.collection('media_library').updateOne(
    { _id: mediaId as any },
    { $inc: { usageCount: 1 }, $set: { lastUsed: new Date() } }
  );
}

// ---- Fetch media buffer from URL ----

async function fetchMediaBuffer(url: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    // Detect mime type from URL extension or Content-Type header
    const contentType = res.headers.get('content-type') || '';
    let mimeType = contentType.split(';')[0].trim();

    // Fall back to extension-based detection
    if (!mimeType || mimeType === 'application/octet-stream') {
      const ext = url.split('?')[0].split('.').pop()?.toLowerCase();
      const extMap: Record<string, string> = {
        gif: 'image/gif',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        webp: 'image/webp',
        mp4: 'video/mp4',
        mov: 'video/quicktime',
      };
      mimeType = extMap[ext ?? ''] ?? 'image/png';
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    return { buffer, mimeType };
  } catch (err: any) {
    console.error(`[PostEngine] Failed to fetch media from ${url}:`, err.message);
    return null;
  }
}

// ---- Weighted random post type ----

function pickPostType(recentTypes: string[]): PostType {
  const weights: Record<PostType, number> = {
    hot_take:  25,
    shitpost:  25,
    nft_image: 18,
    gif:       14,
    mp4:       8,
    trending:  10,
  };

  // Reduce weight of last used type to avoid repeats
  const lastType = recentTypes[recentTypes.length - 1] as PostType;
  if (lastType && weights[lastType] !== undefined) {
    weights[lastType] = Math.max(1, weights[lastType] - 20);
  }

  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;

  for (const [type, weight] of Object.entries(weights)) {
    rand -= weight;
    if (rand <= 0) return type as PostType;
  }

  return 'shitpost';
}

// ---- Save post record ----

async function savePost(data: {
  content: string;
  type: PostType;
  tweetId: string | null;
  mediaId?: string;
  status: 'live' | 'failed';
}): Promise<void> {
  const db = await getDb();
  await db.collection('posts').insertOne({
    ...data,
    postedAt: new Date(),
    impressions: 0,
    likes: 0,
    retweets: 0,
    replies: 0,
    createdAt: new Date(),
  });
}

async function getRecentPostTypes(n = 5): Promise<string[]> {
  const db = await getDb();
  const recent = await db.collection('posts')
    .find({ status: 'live' })
    .sort({ postedAt: -1 })
    .limit(n)
    .toArray();
  return recent.map(p => p.type);
}

// ---- Fallback to shitpost ----

async function fallbackShitpost(twitter: ReturnType<typeof import('./twitterClient').getTwitterClient>): Promise<{ content: string; tweetId: string | null }> {
  const content = await generateShitpost();
  const tweetId = await twitter.tweet(content);
  return { content, tweetId };
}

// ---- Exported content generator for queue engine ----

export interface PostContent {
  content: string;
  type: string;
  trendName?: string;
  trendCategory?: string;
  newsContext?: Array<{ headline: string; source: string }>;
  gifMediaItem?: MediaItem;
  topicUsed?: string; // the topic/seed used for generation, for display in queue
}

export async function generatePostContent(forceType?: string): Promise<PostContent> {
  const recentTypes = await getRecentPostTypes();
  const type = (forceType as PostType) ?? pickPostType(recentTypes);

  if (type === 'shitpost') {
    return { content: await generateShitpost(), type };
  } else if (type === 'hot_take') {
    const gif = await selectMedia('gif');
    const { content, topic } = await generateHotTake(gif?.name);
    // Re-select GIF now that we have content — may find a lingo-matched one
    const matchedGif = await selectMedia('gif', undefined, content);
    return { content, type, gifMediaItem: matchedGif ?? gif ?? undefined, topicUsed: topic };
  } else if (type === 'trending') {
    const trend = await pickTrendForPost();
    if (!trend) {
      const gif = await selectMedia('gif');
      const { content, topic } = await generateHotTake(gif?.name);
      return { content, type: 'hot_take', gifMediaItem: gif ?? undefined, topicUsed: topic };
    }
    return {
      content: await generateTrendingPost(trend),
      type,
      trendName: trend.name,
      trendCategory: trend.category,
      newsContext: trend.newsContext.map(n => ({ headline: n.headline, source: n.source })),
      topicUsed: trend.name,
    };
  } else if (type === 'nft_image') {
    return { content: await generateNftCaption(), type };
  } else if (type === 'gif') {
    return { content: await generateShitpost(), type };
  } else if (type === 'mp4') {
    return { content: await generateMp4Caption(), type };
  }
  return { content: await generateShitpost(), type: 'shitpost' };
}

// ---- Publish from queue (fires a pre-generated queued post) ----

export async function publishFromQueue(queuedPost: import('./queueEngine').QueuedPost): Promise<boolean> {
  const twitter = getTwitterClient();

  try {
    let mediaId: string | undefined;
    let content = queuedPost.content;
    const type = queuedPost.type as PostType;

    // Prefer animated video if available, fall back to static image
    if (queuedPost.videoBase64) {
      const buffer = Buffer.from(queuedPost.videoBase64, 'base64');
      const uploadedId = await twitter.uploadMedia(buffer, 'video/mp4');
      if (uploadedId) mediaId = uploadedId;
    } else if (queuedPost.imageBase64) {
      const buffer = Buffer.from(queuedPost.imageBase64, 'base64');
      const uploadedId = await twitter.uploadMedia(buffer, queuedPost.imageMimeType ?? 'image/png');
      if (uploadedId) mediaId = uploadedId;
    }

    // Handle stored GIF for hot_take posts
    if (type === 'hot_take' && queuedPost.gifMediaUrl && !mediaId) {
      const fetched = await fetchMediaBuffer(queuedPost.gifMediaUrl);
      if (fetched) {
        const uploadedId = await twitter.uploadMedia(fetched.buffer, fetched.mimeType);
        if (uploadedId) {
          mediaId = uploadedId;
          if (queuedPost.gifMediaId) await markMediaUsed(queuedPost.gifMediaId);
        }
      }
    }

    // Handle media library posts (gif, nft_image, mp4)
    if (type === 'nft_image' || type === 'gif' || type === 'mp4') {
      const mediaType = type === 'nft_image' ? 'ipfs_image' : type as 'gif' | 'mp4';
      const media = await selectMedia(mediaType);
      if (media) {
        const fetched = await fetchMediaBuffer(media.url);
        if (fetched) {
          const uploadedId = await twitter.uploadMedia(fetched.buffer, fetched.mimeType);
          if (uploadedId) {
            mediaId = uploadedId;
            await markMediaUsed(media._id);
          }
        }
      }
    }

    const tweetId = await twitter.tweet(content, mediaId);
    await savePost({ content, type, tweetId, mediaId, status: tweetId ? 'live' : 'failed' });

    console.log(`[PostEngine] ${tweetId ? '✓ Posted from queue' : '✗ Failed'}: "${content.slice(0, 60)}..."`);
    return !!tweetId;

  } catch (err: any) {
    console.error('[PostEngine] publishFromQueue error:', err.message);
    return false;
  }
}

// ---- Main publish function (direct, bypasses queue) ----

export async function publishPost(forceType?: string): Promise<boolean> {
  const twitter = getTwitterClient();
  const recentTypes = await getRecentPostTypes();
  const type = (forceType as PostType) ?? pickPostType(recentTypes);

  console.log(`[PostEngine] Publishing post type: ${type}`);

  try {
    let content = '';
    let tweetId: string | null = null;
    let mediaId: string | undefined;

    if (type === 'shitpost') {
      content = await generateShitpost();
      tweetId = await twitter.tweet(content);

    } else if (type === 'hot_take') {
      const gif = await selectMedia('gif');
      const { content: hotContent } = await generateHotTake(gif?.name);
      content = hotContent;
      if (gif) {
        const fetched = await fetchMediaBuffer(gif.url);
        if (fetched) {
          const uploadedId = await twitter.uploadMedia(fetched.buffer, fetched.mimeType);
          if (uploadedId) { mediaId = uploadedId; await markMediaUsed(gif._id); }
        }
      }
      tweetId = await twitter.tweet(content, mediaId);

    } else if (type === 'trending') {
      const trend = await pickTrendForPost();
      if (!trend) {
        console.warn('[PostEngine] No qualifying trends found, falling back to hot_take');
        const gif = await selectMedia('gif');
        const { content: hotContent } = await generateHotTake(gif?.name);
        content = hotContent;
        if (gif) {
          const fetched = await fetchMediaBuffer(gif.url);
          if (fetched) {
            const uploadedId = await twitter.uploadMedia(fetched.buffer, fetched.mimeType);
            if (uploadedId) { mediaId = uploadedId; await markMediaUsed(gif._id); }
          }
        }
        tweetId = await twitter.tweet(content, mediaId);
        await savePost({ content, type: 'hot_take', tweetId, status: tweetId ? 'live' : 'failed' });
        return !!tweetId;
      }

      content = await generateTrendingPost(trend);

      // Generate pixel art scene description then animate
      try {
        const { extractTrendingScene } = await import('./pixelArt');
        const scene = await extractTrendingScene(trend.name, trend.category);
        const result = await generateAndAnimate(scene, trend.category, true);

        if (result.videoBuffer) {
          const uploadedId = await twitter.uploadMedia(result.videoBuffer, 'video/mp4');
          if (uploadedId) mediaId = uploadedId;
          console.log(`[PostEngine] Animated video ready for: "${trend.name}"`);
        } else if (result.imageBuffer) {
          const uploadedId = await twitter.uploadMedia(result.imageBuffer, 'image/png');
          if (uploadedId) mediaId = uploadedId;
          console.log(`[PostEngine] Static image ready for: "${trend.name}"`);
        }
      } catch (err: any) {
        console.warn('[PostEngine] Media generation failed, posting text only:', err.message);
      }

      tweetId = await twitter.tweet(content, mediaId);
      console.log(`[PostEngine] Trending post: "${trend.name}" (${trend.category})`);

    } else if (type === 'nft_image') {
      const media = await selectMedia('ipfs_image');
      if (!media) {
        console.warn('[PostEngine] No available NFT images, falling back to shitpost');
        const fb = await fallbackShitpost(twitter);
        content = fb.content; tweetId = fb.tweetId;
        await savePost({ content, type: 'shitpost', tweetId, status: tweetId ? 'live' : 'failed' });
        return !!tweetId;
      }

      content = await generateNftCaption();
      const fetched = await fetchMediaBuffer(media.url);

      if (fetched) {
        const uploadedId = await twitter.uploadMedia(fetched.buffer, fetched.mimeType);
        if (uploadedId) mediaId = uploadedId;
      }

      tweetId = await twitter.tweet(content, mediaId);
      if (tweetId) await markMediaUsed(media._id);

    } else if (type === 'gif') {
      const media = await selectMedia('gif');
      if (!media) {
        console.warn('[PostEngine] No available GIFs, falling back to shitpost');
        const fb = await fallbackShitpost(twitter);
        content = fb.content; tweetId = fb.tweetId;
        await savePost({ content, type: 'shitpost', tweetId, status: tweetId ? 'live' : 'failed' });
        return !!tweetId;
      }

      content = await generateShitpost();
      const fetched = await fetchMediaBuffer(media.url);

      if (fetched) {
        const uploadedId = await twitter.uploadMedia(fetched.buffer, fetched.mimeType);
        if (uploadedId) mediaId = uploadedId;
      }

      tweetId = await twitter.tweet(content, mediaId);
      if (tweetId) await markMediaUsed(media._id);

    } else if (type === 'mp4') {
      const media = await selectMedia('mp4');
      if (!media) {
        console.warn('[PostEngine] No available MP4s, falling back to shitpost');
        const fb = await fallbackShitpost(twitter);
        content = fb.content; tweetId = fb.tweetId;
        await savePost({ content, type: 'shitpost', tweetId, status: tweetId ? 'live' : 'failed' });
        return !!tweetId;
      }

      content = await generateMp4Caption(media.name);
      const fetched = await fetchMediaBuffer(media.url);

      if (fetched) {
        const uploadedId = await twitter.uploadMedia(fetched.buffer, fetched.mimeType);
        if (uploadedId) mediaId = uploadedId;
      }

      tweetId = await twitter.tweet(content, mediaId);
      if (tweetId) await markMediaUsed(media._id);
    }

    await savePost({ content, type, tweetId, mediaId, status: tweetId ? 'live' : 'failed' });

    console.log(`[PostEngine] ${tweetId ? '✓ Posted' : '✗ Failed'}: "${content.slice(0, 60)}..."`);
    return !!tweetId;

  } catch (err: any) {
    console.error('[PostEngine] Error:', err.message);
    return false;
  }
}
