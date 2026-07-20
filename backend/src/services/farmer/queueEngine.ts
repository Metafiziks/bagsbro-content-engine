// ============================================
// Bags Bro! Queue Engine
// Pre-generates posts in the morning, saves
// to post_queue collection for review/editing.
// Scheduler fires from queue at scheduled time.
// ============================================

import { ObjectId } from 'mongodb';
import { getDb } from '../../db/mongodb';
import { generatePostContent, PostContent } from './postEngine';
import { generateAndAnimate } from './videoEngine';
import { generateBagTechPixelArt } from './pixelArt';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export type QueueStatus = 'scheduled' | 'posted' | 'skipped';

export interface QueuedPost {
  _id?: ObjectId;
  type: string;
  content: string;
  scheduledFor: Date;
  status: QueueStatus;
  // Image — stored as base64 for preview, Cloudinary URL if promoted
  imageBase64?: string;
  imageDescription?: string;
  imageMimeType?: string;
  imageCloudinaryUrl?: string;  // set when promoted to media library
  // Video — animated MP4 from Seedance
  videoBase64?: string;         // stored temporarily for queue preview
  videoUrl?: string;            // Wavespeed CDN URL
  animated?: boolean;           // whether video was generated
  // Trending metadata
  trendName?: string;
  trendCategory?: string;
  newsContext?: Array<{ headline: string; source: string }>;
  // GIF for hot_take posts
  gifMediaId?: string;   // media_library _id
  gifMediaUrl?: string;  // Cloudinary URL
  topicUsed?: string;    // topic seed or trend name for display in queue UI
  // Tracking
  tweetId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ── Upload base64 image to Cloudinary ─────────────────────────────────────────

async function uploadToCloudinary(
  base64: string,
  name: string,
  mimeType: string
): Promise<string> {
  const dataUri = `data:${mimeType};base64,${base64}`;
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      dataUri,
      {
        folder: 'bags-bro/ai-generated',
        public_id: name.toLowerCase().replace(/\s+/g, '-'),
        overwrite: false,
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result!.secure_url);
      }
    );
  });
}

// ── Pre-generate a single queued post ─────────────────────────────────────────

async function generateQueuedPost(scheduledFor: Date): Promise<QueuedPost> {
  const { content, type, trendName, trendCategory, newsContext, gifMediaItem, topicUsed } = await generatePostContent();

  const post: QueuedPost = {
    type,
    content,
    scheduledFor,
    status: 'scheduled',
    trendName,
    trendCategory,
    newsContext,
    topicUsed,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Store GIF reference for hot_take posts
  if (gifMediaItem) {
    post.gifMediaId = gifMediaItem._id.toString();
    post.gifMediaUrl = gifMediaItem.url;
  }

  // Generate pixel art + animation for trending and bag_tech posts
  if (type === 'trending' && trendName && trendCategory) {
    try {
      const { extractTrendingScene } = await import('./pixelArt');
      const scene = await extractTrendingScene(trendName, trendCategory);
      const result = await generateAndAnimate(scene, trendCategory, true);

      post.imageBase64 = result.imageBuffer.toString('base64');
      post.imageDescription = result.imageDescription;
      post.imageMimeType = 'image/png';
      post.animated = result.animated;

      if (result.videoBuffer) {
        post.videoBase64 = result.videoBuffer.toString('base64');
        post.videoUrl = result.videoUrl;
        console.log(`[QueueEngine] Animated video generated for: "${trendName}"`);
      } else {
        console.log(`[QueueEngine] Static pixel art generated for: "${trendName}"`);
      }
    } catch (err: any) {
      console.warn('[QueueEngine] Pixel art/animation failed:', err.message);
    }
  } else if (type === 'bag_tech') {
    try {
      const art = await generateBagTechPixelArt(content);
      post.imageBase64 = art.imageBuffer.toString('base64');
      post.imageDescription = art.imageDescription;
      post.imageMimeType = 'image/png';

      // Also try to animate bag_tech posts
      if (art.imageUrl) {
        try {
          const { animatePixelArt } = await import('./videoEngine');
          const animation = await animatePixelArt(art.imageUrl, art.imageDescription);
          post.videoBase64 = animation.videoBuffer.toString('base64');
          post.videoUrl = animation.videoUrl;
          post.animated = true;
          console.log('[QueueEngine] BagTech animated video generated');
        } catch (animErr: any) {
          console.warn('[QueueEngine] BagTech animation failed:', animErr.message);
        }
      }
    } catch (err: any) {
      console.warn('[QueueEngine] BagTech pixel art failed:', err.message);
    }
  }

  return post;
}

// ── Check if today's queue already exists ─────────────────────────────────────

async function todayQueueExists(): Promise<boolean> {
  const db = await getDb();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const count = await db.collection('post_queue').countDocuments({
    scheduledFor: { $gte: today, $lt: tomorrow },
    status: 'scheduled',
  });

  return count > 0;
}

// ── Main: generate today's full queue ─────────────────────────────────────────

export async function generateDailyQueue(
  schedule: Array<{ fireAt: Date }>,
  forceRegenerate = false
): Promise<void> {
  if (!forceRegenerate && await todayQueueExists()) {
    console.log('[QueueEngine] Today\'s queue already exists, skipping generation');
    return;
  }

  console.log(`[QueueEngine] Pre-generating ${schedule.length} posts for today...`);
  const db = await getDb();

  for (const slot of schedule) {
    try {
      const post = await generateQueuedPost(slot.fireAt);
      await db.collection('post_queue').insertOne(post);
      console.log(`[QueueEngine] Queued ${post.type} post for ${slot.fireAt.toLocaleTimeString('en-US', { timeZone: 'America/New_York' })}`);

      // Small delay between generations to avoid rate limits
      await new Promise(r => setTimeout(r, 2000));
    } catch (err: any) {
      console.error('[QueueEngine] Failed to generate queued post:', err.message);
    }
  }

  console.log('[QueueEngine] Daily queue generation complete');
}

// ── Get next due post from queue ──────────────────────────────────────────────

export async function getNextQueuedPost(): Promise<QueuedPost | null> {
  const db = await getDb();
  const now = new Date();

  const post = await db.collection<QueuedPost>('post_queue').findOne({
    status: 'scheduled',
    scheduledFor: { $lte: now },
  }, {
    sort: { scheduledFor: 1 },
  });

  return post ?? null;
}

// ── Mark a queued post as posted ──────────────────────────────────────────────

export async function markQueuedPostPosted(
  id: ObjectId,
  tweetId: string
): Promise<void> {
  const db = await getDb();
  await db.collection('post_queue').updateOne(
    { _id: id },
    { $set: { status: 'posted', tweetId, updatedAt: new Date() } }
  );
}

// ── Update queued post content (for editing) ──────────────────────────────────

export async function updateQueuedPost(
  id: string,
  updates: { content?: string; imageBase64?: string; imageDescription?: string }
): Promise<void> {
  const db = await getDb();
  await db.collection('post_queue').updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: new Date() } }
  );
}

// ── Promote image to media library ───────────────────────────────────────────

export async function promoteImageToLibrary(
  queueId: string,
  name: string,
  tags: string[],
  sentiment: string
): Promise<string> {
  const db = await getDb();
  const post = await db.collection<QueuedPost>('post_queue').findOne({
    _id: new ObjectId(queueId),
  });

  if (!post?.imageBase64) throw new Error('No image found for this post');

  // Upload to Cloudinary permanent folder
  const url = await uploadToCloudinary(
    post.imageBase64,
    name,
    post.imageMimeType ?? 'image/png'
  );

  // Save to media_library
  await db.collection('media_library').insertOne({
    name,
    type: 'ipfs_image',
    url,
    tags,
    sentiment,
    cooldownHours: 72,
    active: true,
    usageCount: 0,
    lastUsed: null,
    sourceQueueId: queueId,
    createdAt: new Date(),
  });

  // Update queue post with Cloudinary URL
  await db.collection('post_queue').updateOne(
    { _id: new ObjectId(queueId) },
    { $set: { imageCloudinaryUrl: url, updatedAt: new Date() } }
  );

  return url;
}

// ── Get queue for dashboard ───────────────────────────────────────────────────

export async function getPostQueue(limit = 20): Promise<QueuedPost[]> {
  const db = await getDb();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return db.collection<QueuedPost>('post_queue')
    .find({ scheduledFor: { $gte: today } })
    .sort({ scheduledFor: 1 })
    .limit(limit)
    .toArray();
}

// ── Regenerate content for a queued post ─────────────────────────────────────

export async function regenerateQueuedPostContent(id: string): Promise<QueuedPost> {
  const db = await getDb();
  const existing = await db.collection<QueuedPost>('post_queue').findOne({
    _id: new ObjectId(id),
  });
  if (!existing) throw new Error('Post not found');

  const { content, type } = await generatePostContent(existing.type);
  await db.collection('post_queue').updateOne(
    { _id: new ObjectId(id) },
    { $set: { content, updatedAt: new Date() } }
  );

  return { ...existing, content };
}

// ── Regenerate image for a queued post ───────────────────────────────────────

export async function regenerateQueuedPostImage(id: string): Promise<string> {
  const db = await getDb();
  const post = await db.collection<QueuedPost>('post_queue').findOne({
    _id: new ObjectId(id),
  });
  if (!post) throw new Error('Post not found');

  let imageBase64: string;
  let videoBase64: string | undefined;
  let videoUrl: string | undefined;

  if (post.type === 'trending' && post.trendName && post.trendCategory) {
    const { extractTrendingScene } = await import('./pixelArt');
    const scene = await extractTrendingScene(post.trendName, post.trendCategory);
    const result = await generateAndAnimate(scene, post.trendCategory, true);
    imageBase64 = result.imageBuffer.toString('base64');
    if (result.videoBuffer) {
      videoBase64 = result.videoBuffer.toString('base64');
      videoUrl = result.videoUrl;
    }
  } else {
    const art = await generateBagTechPixelArt(post.content);
    imageBase64 = art.imageBuffer.toString('base64');
    if (art.imageUrl) {
      try {
        const { animatePixelArt } = await import('./videoEngine');
        const animation = await animatePixelArt(art.imageUrl, art.imageDescription ?? post.content);
        videoBase64 = animation.videoBuffer.toString('base64');
        videoUrl = animation.videoUrl;
      } catch { /* animation optional */ }
    }
  }

  await db.collection('post_queue').updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        imageBase64,
        videoBase64,
        videoUrl,
        animated: !!videoBase64,
        updatedAt: new Date(),
      },
    }
  );

  return imageBase64;
}
