// ============================================
// Bags Bro! Video Engine
// Takes a pixel art image URL and animates it
// using Bytedance Seedance V1.5 Pro via Wavespeed.
// Returns MP4 buffer ready for Twitter upload.
// ============================================

const WAVESPEED_API_KEY = process.env.WAVESPEED_API_KEY!;
const WAVESPEED_BASE = 'https://api.wavespeed.ai/api/v3';

// ── Motion prompt generator ───────────────────────────────────────────────────
// Generates a Seedance-optimized motion prompt from the image scene description

export function buildMotionPrompt(
  scene: string,
  category?: string
): string {
  // Category-specific motion styles
  const motionStyles: Record<string, string> = {
    crypto:        'pixel elements pulse and glow, coins spin slowly, dramatic zoom-in',
    markets:       'chart bars animate up and down, camera slowly pushes in, glowing tickers scroll',
    money:         'coins pour and stack, vault door swings open, golden glow pulses',
    hiphop:        'turntable spins, speaker cones pulse to beat, camera bobs rhythmically',
    music:         'sound waves ripple outward, record spins, neon lights pulse',
    entertainment: 'screen flickers to life, dramatic zoom-in, cinematic lens flare sweep',
    culture:       'pixel crowd sways, energy radiates outward, subtle camera drift',
    tech:          'circuit lines light up, robot blinks, data streams flow',
    sports_degen:  'scoreboard numbers flip, crowd pixels wave, dramatic slow push-in',
    general:       'subtle parallax drift, glowing elements pulse, gentle camera float',
  };

  const motionStyle = category
    ? (motionStyles[category] ?? motionStyles.general)
    : motionStyles.general;

  return `Pixel art animation. ${scene}. ${motionStyle}. 
Locked pixel art aesthetic throughout, no style drift. 
Subtle but expressive motion, loopable feel. 
Cinematic NES-era energy, neon orange and cyan glow pulses. Camera: slow drift or subtle zoom.`;
}

// ── Wavespeed polling ─────────────────────────────────────────────────────────

async function pollWavespeedResult(
  taskId: string,
  maxWaitMs = 300_000  // 5 min — video takes longer than images
): Promise<string> {
  const deadline = Date.now() + maxWaitMs;
  const pollUrl = `${WAVESPEED_BASE}/predictions/${taskId}/result`;

  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 5000)); // poll every 5s for video

    const res = await fetch(pollUrl, {
      headers: { Authorization: `Bearer ${WAVESPEED_API_KEY}` },
    });
    const json = await res.json() as {
      code: number;
      data: { status: string; outputs?: string[]; error?: string };
    };

    console.log(`[VideoEngine] Task ${taskId} status: ${json.data.status}`);

    if (json.data.status === 'completed') {
      const url = json.data.outputs?.[0];
      if (!url) throw new Error('Seedance completed but no output URL');
      return url;
    }
    if (json.data.status === 'failed') {
      throw new Error(`Seedance task failed: ${json.data.error ?? 'unknown'}`);
    }
  }

  throw new Error('Seedance task timed out after 5 minutes');
}

// ── Main animation function ───────────────────────────────────────────────────

export interface AnimationResult {
  videoBuffer: Buffer;
  videoUrl: string;
  durationSeconds: number;
}

export async function animatePixelArt(
  imageUrl: string,
  scene: string,
  category?: string,
  durationSeconds = 7
): Promise<AnimationResult> {
  if (!WAVESPEED_API_KEY) {
    throw new Error('WAVESPEED_API_KEY not set — cannot animate');
  }

  const prompt = buildMotionPrompt(scene, category);
  console.log(`[VideoEngine] Animating with Seedance 1.5 Pro: "${scene.slice(0, 50)}..."`);

  // Submit to Seedance V1.5 Pro Fast image-to-video ($0.20 vs $0.40 for full Pro)
  const submitRes = await fetch(
    `${WAVESPEED_BASE}/bytedance/seedance-v1.5-pro/image-to-video-fast`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WAVESPEED_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageUrl,
        prompt,
        duration: durationSeconds,
        resolution: '720p',
        aspect_ratio: '1:1',   // square — matches our pixel art
        generate_audio: false,
        camera_fixed: false,
        seed: -1,
      }),
    }
  );

  const submitJson = await submitRes.json() as {
    code: number;
    data: { id: string; status: string };
  };

  if (submitJson.code !== 200) {
    throw new Error(`Seedance submit failed (${submitJson.code}): ${JSON.stringify(submitJson)}`);
  }

  const taskId = submitJson.data.id;
  console.log(`[VideoEngine] Seedance task submitted: ${taskId}`);

  // Poll for completion
  const videoUrl = await pollWavespeedResult(taskId);
  console.log(`[VideoEngine] Seedance video ready: ${videoUrl}`);

  // Fetch video buffer
  const vidRes = await fetch(videoUrl);
  if (!vidRes.ok) throw new Error(`Failed to fetch video from CDN: ${vidRes.status}`);
  const videoBuffer = Buffer.from(await vidRes.arrayBuffer());

  return { videoBuffer, videoUrl, durationSeconds };
}

// ── Combined: pixel art + animation pipeline ──────────────────────────────────
// Used by postEngine and queueEngine for trending/bagtech posts

export interface AnimatedPixelArtResult {
  imageBuffer: Buffer;
  imageDescription: string;
  imageUrl?: string;
  videoBuffer?: Buffer;
  videoUrl?: string;
  animated: boolean;
  provider: 'wavespeed' | 'replicate';
}

export async function generateAndAnimate(
  scene: string,
  category?: string,
  shouldAnimate = true
): Promise<AnimatedPixelArtResult> {
  // Import here to avoid circular deps
  const { generatePixelArt } = await import('./pixelArt');

  // Step 1: Generate pixel art (blocking — we need the buffer)
  const art = await generatePixelArt(scene);

  // Step 2: Kick off Seedance animation async if we have a CDN URL
  // We do NOT await this — it takes 2-4 min and would blow Cloud Run timeout.
  // Instead it updates MongoDB directly when done via updateQueueVideoById.
  if (shouldAnimate && art.imageUrl && art.provider === 'wavespeed') {
    setImmediate(async () => {
      try {
        console.log('[VideoEngine] Starting background Seedance animation...');
        const animation = await animatePixelArt(art.imageUrl!, scene, category);
        // Find the most recently inserted queue post for this scene and update it
        await updateQueueVideoByScene(scene, animation.videoBuffer, animation.videoUrl);
        console.log('[VideoEngine] Background animation saved to queue post');
      } catch (err: any) {
        console.warn('[VideoEngine] Background animation failed:', err.message);
      }
    });
  }

  // Return immediately with static image — video will arrive in the background
  return {
    imageBuffer: art.imageBuffer,
    imageDescription: art.imageDescription,
    imageUrl: art.imageUrl,
    animated: false,        // starts false; background job sets to true in DB
    provider: art.provider,
  };
}

// ── Background DB update when Seedance finishes ───────────────────────────────

async function updateQueueVideoByScene(
  scene: string,
  videoBuffer: Buffer,
  videoUrl: string
): Promise<void> {
  const { getDb } = await import('../../db/mongodb');
  const db = await getDb();

  // Find the most recent scheduled post whose imageDescription matches this scene
  const post = await db.collection('post_queue').findOne(
    { imageDescription: scene, status: 'scheduled' },
    { sort: { createdAt: -1 } }
  );

  if (!post) {
    console.warn('[VideoEngine] Could not find queue post to attach video for scene:', scene);
    return;
  }

  await db.collection('post_queue').updateOne(
    { _id: post._id },
    {
      $set: {
        videoBase64: videoBuffer.toString('base64'),
        videoUrl,
        animated: true,
        updatedAt: new Date(),
      },
    }
  );

  console.log(`[VideoEngine] Video attached to queue post ${post._id}`);
}
