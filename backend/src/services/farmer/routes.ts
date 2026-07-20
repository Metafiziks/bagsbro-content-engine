// ============================================
// Bags Bro! Farmer API Routes
// Admin endpoints for dashboard control
// Protected by ADMIN_SECRET header
// ============================================

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v2 as cloudinary } from 'cloudinary';
import { ObjectId } from 'mongodb';
import { getDb } from '../../db/mongodb';
import { publishPost, publishFromQueue } from './postEngine';
import { approvePendingReply, skipPendingReply, getPendingReplies } from './replyEngine';
import { getSchedulerStatus } from './scheduler';
import {
  getPostQueue,
  updateQueuedPost,
  regenerateQueuedPostContent,
  regenerateQueuedPostImage,
  promoteImageToLibrary,
} from './queueEngine';
import { getTrendingStatus, fetchTrendingTopics } from './trendingEngine';
import * as fs from 'fs';
import * as path from 'path';
import type { Db } from 'mongodb';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Skill graph lingo sync ────────────────────────────────────────────────────

async function buildLingoMarkdown(db: Db): Promise<string> {
  const entries = await db
    .collection('lingo')
    .find({ active: true })
    .sort({ term: 1 })
    .toArray();

  const lines: string[] = [
    '# Bags Bro! Lingo',
    '',
    '---',
    "description: The full Bagaverse dictionary. Use these naturally in posts — never forced, never explained. If you have to explain it, don't use it. Auto-generated from the platform lingo database.",
    '---',
    '',
    '## The Dictionary',
    '',
  ];

  for (const entry of entries) {
    lines.push(`**${entry.term}** — ${entry.definition}`);
    if (entry.examples?.length > 0) {
      for (const ex of (entry.examples as string[]).slice(0, 2)) {
        lines.push(`> *"${ex}"*`);
      }
    }
    if (entry.usageContext?.length > 0) {
      lines.push(`*Usage: ${(entry.usageContext as string[]).join(', ')}*`);
    }
    lines.push('');
  }

  lines.push(
    '---',
    '',
    '## Usage Rules',
    '',
    '- Use lingo **sparingly** — one or two terms per post maximum, never stack them',
    '- Never define them in the post — the audience either knows or they learn by context',
    '- They work best as **punchy endings** or **casual asides**, not as the centerpiece',
    '- Some terms (BM) work as openers, most work better mid-post or as a closer',
    '- See [[brand/voice]] for the overall tone these terms should sit inside',
    '',
    `*Last synced: ${new Date().toISOString()} — ${entries.length} active terms*`,
  );

  return lines.join('\n');
}

async function syncLingoSkillGraph(db: Db): Promise<void> {
  const skillGraphPath = process.env.SKILL_GRAPH_PATH;
  if (!skillGraphPath) return; // no-op if not configured

  const lingoPath = path.join(skillGraphPath, 'brand', 'lingo.md');
  const md = await buildLingoMarkdown(db);
  fs.mkdirSync(path.dirname(lingoPath), { recursive: true });
  fs.writeFileSync(lingoPath, md, 'utf8');
  console.log(`[SkillGraph] lingo.md synced — ${lingoPath}`);
}

function requireAdmin(req: FastifyRequest, reply: FastifyReply): boolean {
  const secret = req.headers['x-admin-secret'];
  if (secret !== process.env.ADMIN_SECRET) {
    reply.status(401).send({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

export async function registerFarmerRoutes(app: FastifyInstance): Promise<void> {

  // ---- Status ----

  app.get('/farmer/status', async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const status = await getSchedulerStatus();
    return status;
  });

  // ---- Trends diagnostics ----

  app.get('/farmer/trends/status', async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    return getTrendingStatus();
  });

  app.post('/farmer/trends/refresh', async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const trends = await fetchTrendingTopics(true);
    return { success: true, count: trends.length, trends: trends.map(t => ({ name: t.name, score: t.score, category: t.category })) };
  });

  // ---- Post Queue ----

  app.get('/farmer/queue', async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const queue = await getPostQueue(30);
    // Strip imageBase64 and videoBase64 from list view for performance — only send for single post
    return queue.map(p => ({
      ...p,
      imageBase64: p.imageBase64 ? '[image]' : undefined,
      videoBase64: p.videoBase64 ? '[video]' : undefined,
    }));
  });

  app.get('/farmer/queue/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply) => {
    if (!requireAdmin(req, reply)) return;
    const db = await getDb();
    const post = await db.collection('post_queue').findOne({ _id: new ObjectId(req.params.id) });
    if (!post) { reply.status(404).send({ error: 'Not found' }); return; }
    return post;
  });

  app.patch('/farmer/queue/:id', async (req: FastifyRequest<{
    Params: { id: string };
    Body: { content?: string };
  }>, reply) => {
    if (!requireAdmin(req, reply)) return;
    await updateQueuedPost(req.params.id, req.body);
    return { success: true };
  });

  app.post('/farmer/queue/:id/regenerate-content', async (req: FastifyRequest<{ Params: { id: string } }>, reply) => {
    if (!requireAdmin(req, reply)) return;
    const updated = await regenerateQueuedPostContent(req.params.id);
    return { success: true, content: updated.content };
  });

  app.post('/farmer/queue/:id/regenerate-image', async (req: FastifyRequest<{ Params: { id: string } }>, reply) => {
    if (!requireAdmin(req, reply)) return;
    try {
      const imageBase64 = await regenerateQueuedPostImage(req.params.id);
      // Fetch the updated post to get video fields too
      const db = await getDb();
      const { ObjectId } = await import('mongodb');
      const post = await db.collection('post_queue').findOne({ _id: new ObjectId(req.params.id) });
      return {
        success: true,
        imageBase64,
        videoBase64: post?.videoBase64 ?? null,
        videoUrl: post?.videoUrl ?? null,
        animated: !!post?.videoBase64,
      };
    } catch (err: any) {
      console.error('[Routes] regenerate-image failed:', err.message);
      reply.status(500).send({ success: false, error: err.message });
    }
  });

  app.post('/farmer/queue/:id/promote-image', async (req: FastifyRequest<{
    Params: { id: string };
    Body: { name: string; tags: string[]; sentiment: string };
  }>, reply) => {
    if (!requireAdmin(req, reply)) return;
    const { name, tags, sentiment } = req.body;
    const url = await promoteImageToLibrary(req.params.id, name, tags, sentiment);
    return { success: true, url };
  });

  app.delete('/farmer/queue/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply) => {
    if (!requireAdmin(req, reply)) return;
    const db = await getDb();
    await db.collection('post_queue').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: 'skipped', updatedAt: new Date() } }
    );
    return { success: true };
  });

  // ---- Posts ----

  app.get('/farmer/posts', async (req: FastifyRequest<{ Querystring: { limit?: string } }>, reply) => {
    if (!requireAdmin(req, reply)) return;
    const db = await getDb();
    const limit = parseInt(req.query.limit ?? '20');
    const posts = await db.collection('posts')
      .find({})
      .sort({ postedAt: -1 })
      .limit(limit)
      .toArray();
    return posts;
  });

  app.post('/farmer/posts/publish-now', async (req: FastifyRequest<{ Querystring: { type?: string } }>, reply) => {
    if (!requireAdmin(req, reply)) return;
    const forceType = req.query.type as string | undefined;
    const success = await publishPost(forceType);
    return { success };
  });

  // ---- Replies ----

  app.get('/farmer/replies/pending', async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const pending = await getPendingReplies();
    return pending;
  });

  app.post('/farmer/replies/:id/approve', async (req: FastifyRequest<{ Params: { id: string } }>, reply) => {
    if (!requireAdmin(req, reply)) return;
    const success = await approvePendingReply(req.params.id);
    return { success };
  });

  app.post('/farmer/replies/:id/skip', async (req: FastifyRequest<{ Params: { id: string } }>, reply) => {
    if (!requireAdmin(req, reply)) return;
    await skipPendingReply(req.params.id);
    return { success: true };
  });

  app.get('/farmer/replies/history', async (req: FastifyRequest<{ Querystring: { limit?: string } }>, reply) => {
    if (!requireAdmin(req, reply)) return;
    const db = await getDb();
    const replies = await db.collection('replies')
      .find({ status: 'sent' })
      .sort({ sentAt: -1 })
      .limit(parseInt(req.query.limit ?? '20'))
      .toArray();
    return replies;
  });

  // ---- Targets ----

  app.get('/farmer/targets', async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const db = await getDb();
    const targets = await db.collection('targets')
      .find({})
      .sort({ tier: 1, handle: 1 })
      .toArray();
    return targets;
  });

  app.post('/farmer/targets', async (req: FastifyRequest<{
    Body: { handle: string; tier: 'S' | 'A' | 'B' | 'C'; autoApprove?: boolean }
  }>, reply) => {
    if (!requireAdmin(req, reply)) return;
    const db = await getDb();
    const { handle, tier, autoApprove = false } = req.body;

    const existing = await db.collection('targets').findOne({ handle });
    if (existing) {
      reply.status(409).send({ error: 'Target already exists' });
      return;
    }

    await db.collection('targets').insertOne({
      handle: handle.replace('@', ''),
      tier,
      autoApprove,
      autoApproveThreshold: 0.75,
      active: true,
      totalReplies: 0,
      lastReplied: null,
      lastChecked: null,
      createdAt: new Date(),
    });

    return { success: true };
  });

  app.patch('/farmer/targets/:handle', async (req: FastifyRequest<{
    Params: { handle: string };
    Body: { active?: boolean; tier?: string; autoApprove?: boolean }
  }>, reply) => {
    if (!requireAdmin(req, reply)) return;
    const db = await getDb();
    await db.collection('targets').updateOne(
      { handle: req.params.handle },
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    return { success: true };
  });

  app.delete('/farmer/targets/:handle', async (req: FastifyRequest<{ Params: { handle: string } }>, reply) => {
    if (!requireAdmin(req, reply)) return;
    const db = await getDb();
    await db.collection('targets').deleteOne({ handle: req.params.handle });
    return { success: true };
  });

  // ---- Media library ----

  app.get('/farmer/media', async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const db = await getDb();
    const media = await db.collection('media_library')
      .find({})
      .sort({ usageCount: 1 })
      .toArray();
    return media;
  });

  // Add a media item by URL (for GIFs and existing IPFS URLs)
  app.post('/farmer/media', async (req: FastifyRequest<{
    Body: { url: string; type: 'gif' | 'ipfs_image' | 'mp4'; tags: string[]; cooldownHours?: number; name?: string }
  }>, reply) => {
    if (!requireAdmin(req, reply)) return;
    const db = await getDb();
    const { url, type, tags, cooldownHours = 72, name } = req.body;

    await db.collection('media_library').insertOne({
      name: name || url.split('/').pop() || url,
      url,
      type,
      tags,
      cooldownHours,
      active: true,
      usageCount: 0,
      lastUsed: null,
      createdAt: new Date(),
    });

    return { success: true };
  });

  // Upload an image/video file to Cloudinary and save to media library
  app.post('/farmer/media/upload', async (req, reply) => {
    if (!requireAdmin(req, reply)) return;

    const data = await req.file();
    if (!data) {
      reply.status(400).send({ error: 'No file provided' });
      return;
    }

    const { filename, mimetype, file, fields } = data;

    // Extract form fields from multipart data
    const getField = (key: string): string => {
      const f = (fields as any)[key];
      if (!f) return '';
      return Array.isArray(f) ? f[0].value : f.value;
    };

    const tagsRaw = getField('tags');
    const name = getField('name') || filename;
    const sentiment = getField('sentiment') || 'neutral';
    const cooldownHours = parseInt(getField('cooldownHours') || '72');

    // Determine if image or video
    const isVideo = mimetype.startsWith('video/');
    const isImage = mimetype.startsWith('image/');

    if (!isVideo && !isImage) {
      reply.status(400).send({ error: 'Only image and video files are supported' });
      return;
    }

    // Read stream into buffer
    const chunks: Buffer[] = [];
    for await (const chunk of file) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Upload to Cloudinary
    const uploadResult = await new Promise<{
      secure_url: string;
      public_id: string;
      duration?: number;
      width?: number;
      height?: number;
      format: string;
      bytes: number;
    }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: isVideo ? 'video' : 'image',
          folder: isVideo ? 'bags-bro/mp4' : 'bags-bro/nft-images',
          public_id: name.toLowerCase().replace(/\s+/g, '-').replace(/\.[^/.]+$/, ''),
          overwrite: false,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as any);
        }
      ).end(buffer);
    });

    const tags = tagsRaw ? tagsRaw.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
    const type = isVideo ? 'mp4' : 'ipfs_image';

    const db = await getDb();
    const doc = await db.collection('media_library').insertOne({
      name,
      type,
      sentiment,
      url: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      cloudinaryMetadata: {
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
        ...(uploadResult.duration ? { duration: uploadResult.duration } : {}),
      },
      tags,
      cooldownHours,
      active: true,
      usageCount: 0,
      lastUsed: null,
      createdAt: new Date(),
    });

    reply.status(201).send({
      success: true,
      id: doc.insertedId,
      url: uploadResult.secure_url,
      type,
    });
  });

  app.delete('/farmer/media/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply) => {
    if (!requireAdmin(req, reply)) return;
    const db = await getDb();
    await db.collection('media_library').deleteOne({ _id: new ObjectId(req.params.id) });
    return { success: true };
  });

  app.patch('/farmer/media/:id', async (req: FastifyRequest<{
    Params: { id: string };
    Body: { name?: string; tags?: string[]; sentiment?: string; cooldownHours?: number }
  }>, reply) => {
    if (!requireAdmin(req, reply)) return;
    const db = await getDb();
    const { name, tags, sentiment, cooldownHours } = req.body;
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) update.name = name;
    if (tags !== undefined) update.tags = tags;
    if (sentiment !== undefined) update.sentiment = sentiment;
    if (cooldownHours !== undefined) update.cooldownHours = cooldownHours;
    await db.collection('media_library').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: update }
    );
    return { success: true };
  });

  // ---- Lingo ----

  app.get('/farmer/lingo', async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const db = await getDb();
    return db.collection('lingo').find({ active: true }).toArray();
  });

  app.post('/farmer/lingo', async (req: FastifyRequest<{
    Body: { term: string; definition: string; usageContext?: string }
  }>, reply) => {
    if (!requireAdmin(req, reply)) return;
    const db = await getDb();
    await db.collection('lingo').insertOne({
      ...req.body,
      active: true,
      createdAt: new Date(),
    });
    setImmediate(() => syncLingoSkillGraph(db).catch(console.warn));
    return { success: true };
  });

  app.patch('/farmer/lingo/:id', async (req: FastifyRequest<{
    Params: { id: string };
    Body: { term?: string; definition?: string; active?: boolean; weight?: number; usageContext?: string[] }
  }>, reply) => {
    if (!requireAdmin(req, reply)) return;
    const db = await getDb();
    await db.collection('lingo').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    setImmediate(() => syncLingoSkillGraph(db).catch(console.warn));
    return { success: true };
  });

  app.delete('/farmer/lingo/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply) => {
    if (!requireAdmin(req, reply)) return;
    const db = await getDb();
    await db.collection('lingo').deleteOne({ _id: new ObjectId(req.params.id) });
    setImmediate(() => syncLingoSkillGraph(db).catch(console.warn));
    return { success: true };
  });

  // ── Publish a specific queued post immediately ────────────────────────────
  app.post('/farmer/queue/:id/publish-now', async (req: FastifyRequest<{ Params: { id: string } }>, reply) => {
    if (!requireAdmin(req, reply)) return;
    try {
      console.log(`[Routes] publish-now: ${req.params.id}`);
      const db = await getDb();
      const post = await db.collection('post_queue').findOne({ _id: new ObjectId(req.params.id) });
      if (!post) { reply.status(404).send({ success: false, error: 'Post not found' }); return; }
      if (post.status === 'posted') { reply.status(400).send({ success: false, error: 'Already posted' }); return; }

      console.log(`[Routes] publish-now: found post type=${post.type}, firing publishFromQueue`);
      const success = await publishFromQueue(post as any);
      console.log(`[Routes] publish-now: publishFromQueue result=${success}`);

      if (success) {
        await db.collection('post_queue').updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: { status: 'posted', postedAt: new Date() } }
        );
        return { success: true };
      } else {
        reply.status(500).send({ success: false, error: 'Failed to post to X — check Twitter credentials' });
      }
    } catch (err: any) {
      console.error('[Routes] queue publish-now failed:', err.message, err.stack);
      reply.status(500).send({ success: false, error: err.message });
    }
  });
  app.post('/farmer/context/seed', async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const { seedContextCollections } = await import('./contextEngine');
    await seedContextCollections();
    return { success: true, message: 'voice_config, post_topics, and lingo tags seeded' };
  });
  // Returns the current lingo.md content — pull this from your local machine
  // to keep the skill graph in sync: curl https://api.bagsbro.io/farmer/skill-graph/lingo

  app.get('/farmer/skill-graph/lingo', async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const db = await getDb();
    const md = await buildLingoMarkdown(db);
    reply.header('Content-Type', 'text/markdown');
    return md;
  });

  // ---- Force queue generation ----

  app.post('/farmer/queue/generate-now', async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const { generateDailyQueue } = await import('./queueEngine');
    const { generateDailySchedule } = await import('./scheduler');
    const schedule = generateDailySchedule();
    // Run async, don't await — returns immediately
    generateDailyQueue(schedule, true).catch(err =>
      console.error('[Routes] Force queue generation error:', err.message)
    );
    return { success: true, message: `Generating ${schedule.length} posts in background` };
  });

  // ---- Activity log ----

  app.get('/farmer/activity', async (req: FastifyRequest<{ Querystring: { limit?: string } }>, reply) => {
    if (!requireAdmin(req, reply)) return;
    const db = await getDb();
    const log = await db.collection('activity_log')
      .find({})
      .sort({ timestamp: -1 })
      .limit(parseInt(req.query.limit ?? '50'))
      .toArray();
    return log;
  });
}
