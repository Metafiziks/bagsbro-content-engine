// ============================================
// Bags Bro! Pixel Art Generator
// Primary: Replicate — custom BALBAGS LoRA
//          trained on 500 Ballers NFT images
// Fallback: Wavespeed Flux Dev LoRA
// Fallback: Wavespeed Flux Dev LoRA
// ============================================

import Anthropic from '@anthropic-ai/sdk';

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const WAVESPEED_API_KEY = process.env.WAVESPEED_API_KEY!;
const WAVESPEED_BASE = 'https://api.wavespeed.ai/api/v3';
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN!;

// ── Custom trained LoRA ───────────────────────────────────────────────────────
// Trained on 500 Bags Bro! Ballers NFTs — trigger word: BALBAGS
const BALBAGS_MODEL = 'metafiziks/bags-bro-ballers-style'; // for reference only

// ── Color palette variants ────────────────────────────────────────────────────
const PALETTE_VARIANTS = [
  'hot pink and red as dominant colors, electric cyan as accent, gold yellow for highlights, deep black background',
  'electric cyan and deep blue as dominant colors, hot pink as accent, gold yellow for glows, deep black background',
  'gold and yellow as dominant colors, hot pink as accent, electric cyan for glow effects, deep black background',
  'deep black and dark navy base, hot pink neon glow, electric cyan neon glow, gold star accents',
  'hot pink and gold as dominant colors, white and cyan for highlights, deep black background',
];

function pickPalette(scene: string): string {
  const hash = scene.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PALETTE_VARIANTS[hash % PALETTE_VARIANTS.length];
}

export const PIXEL_ART_PROMPT = (scene: string) => {
  const palette = pickPalette(scene);
  return `BALBAGS pixel art style. Scene: ${scene}. 
Color palette: ${palette}. 
Thick black pixel outlines, chunky square pixels, high contrast. 
16-bit retro pixel art, dramatic neon lighting and glow effects. 
No text or letters in the image. Square composition, vivid and detailed.`;
};

// ── Replicate inference (primary) ─────────────────────────────────────────────

async function generateWithReplicate(prompt: string): Promise<Buffer> {
  console.log('[PixelArt] Generating with Replicate BALBAGS LoRA...');

  // Submit prediction
  const submitRes = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'feaf87a7779ef402b63309995ee9f88911db8a24120152da13a0c57b3902ef82',
      input: {
        prompt,
        model: 'dev',
        num_outputs: 1,
        aspect_ratio: '1:1',
        output_format: 'png',
        output_quality: 100,
        num_inference_steps: 35,
        guidance_scale: 4.5,
        lora_scale: 1.0,
        go_fast: false,
        disable_safety_checker: true,
      },
    }),
  });

  if (!submitRes.ok) {
    const err = await submitRes.text();
    throw new Error(`Replicate submit failed (${submitRes.status}): ${err}`);
  }

  const prediction = await submitRes.json() as { id: string; urls: { get: string } };
  console.log(`[PixelArt] Replicate prediction: ${prediction.id}`);

  // Poll for result
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 3000));

    const pollRes = await fetch(prediction.urls.get, {
      headers: { Authorization: `Bearer ${REPLICATE_API_TOKEN}` },
    });
    const data = await pollRes.json() as {
      status: string;
      output?: string[];
      error?: string;
    };

    if (data.status === 'succeeded') {
      const url = data.output?.[0];
      if (!url) throw new Error('Replicate succeeded but no output URL');
      console.log(`[PixelArt] Replicate image ready`);
      const imgRes = await fetch(url);
      if (!imgRes.ok) throw new Error(`Failed to fetch image: ${imgRes.status}`);
      return Buffer.from(await imgRes.arrayBuffer());
    }

    if (data.status === 'failed' || data.status === 'canceled') {
      throw new Error(`Replicate prediction ${data.status}: ${data.error ?? 'unknown'}`);
    }
  }

  throw new Error('Replicate prediction timed out after 120s');
}

// ── Wavespeed polling ─────────────────────────────────────────────────────────

async function pollWavespeedResult(
  taskId: string,
  maxWaitMs = 120_000
): Promise<string> {
  const deadline = Date.now() + maxWaitMs;
  const pollUrl = `${WAVESPEED_BASE}/predictions/${taskId}/result`;

  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 3000));

    const res = await fetch(pollUrl, {
      headers: { Authorization: `Bearer ${WAVESPEED_API_KEY}` },
    });
    const json = await res.json() as {
      code: number;
      data: { status: string; outputs?: string[]; error?: string };
    };

    if (json.data.status === 'completed') {
      const url = json.data.outputs?.[0];
      if (!url) throw new Error('Wavespeed completed but no output URL');
      return url;
    }
    if (json.data.status === 'failed') {
      throw new Error(`Wavespeed task failed: ${json.data.error ?? 'unknown'}`);
    }
    // still processing — keep polling
  }

  throw new Error('Wavespeed task timed out after 120s');
}

// ── Core image generation ─────────────────────────────────────────────────────

export interface PixelArtResult {
  imageBuffer: Buffer;
  imageDescription: string;
  imageUrl?: string;   // Wavespeed CDN URL — passed to Seedance for animation
  provider: 'wavespeed' | 'replicate';
}

export async function generatePixelArt(scene: string): Promise<PixelArtResult> {
  const prompt = PIXEL_ART_PROMPT(scene);

  // 1. Try Wavespeed Flux Dev (primary — better compositional results)
  if (WAVESPEED_API_KEY) {
    try {
      console.log('[PixelArt] Generating with Wavespeed Flux Dev...');

      const submitRes = await fetch(
        `${WAVESPEED_BASE}/wavespeed-ai/flux-dev`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${WAVESPEED_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            size: '1024*1024',
            num_inference_steps: 35,
            guidance_scale: 4.5,
            num_images: 1,
            seed: -1,
            output_format: 'png',
            enable_base64_output: false,
            enable_safety_checker: false,
            enable_sync_mode: false,
          }),
        }
      );

      const submitJson = await submitRes.json() as {
        code: number;
        data: { id: string; status: string };
      };

      if (submitJson.code !== 200) {
        throw new Error(`Wavespeed submit failed (${submitJson.code}): ${JSON.stringify(submitJson)}`);
      }

      const imageUrl = await pollWavespeedResult(submitJson.data.id);
      console.log(`[PixelArt] Wavespeed image ready: ${imageUrl}`);

      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) throw new Error(`Failed to fetch image from CDN: ${imgRes.status}`);
      const imageBuffer = Buffer.from(await imgRes.arrayBuffer());

      return { imageBuffer, imageDescription: scene, imageUrl, provider: 'wavespeed' };

    } catch (err: any) {
      console.warn('[PixelArt] Wavespeed failed, trying Replicate:', err.message);
    }
  }

  // 2. Try Replicate BALBAGS LoRA (fallback)
  if (REPLICATE_API_TOKEN) {
    try {
      const imageBuffer = await generateWithReplicate(prompt);
      return { imageBuffer, imageDescription: scene, provider: 'replicate' };
    } catch (err: any) {
      console.warn('[PixelArt] Replicate failed:', err.message);
    }
  }

  throw new Error('All image generation providers failed (Wavespeed + Replicate)');
}

// ── Scene extractors ──────────────────────────────────────────────────────────

const BAGTECH_SCENE_SYSTEM = `You are a visual scene extractor. 
Given a tweet about a fake technology product, extract ONE short sentence (max 15 words) 
describing the key visual scene or object that represents this technology.
Be specific and visual. Focus on the most absurd/interesting element.
Return ONLY the scene description, nothing else.`;

export async function extractBagTechScene(tweetText: string): Promise<string> {
  const res = await claude.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 60,
    system: BAGTECH_SCENE_SYSTEM,
    messages: [{ role: 'user', content: tweetText }],
  });
  return res.content[0].type === 'text'
    ? res.content[0].text.trim()
    : 'a glowing bag floating in space surrounded by pixel energy';
}

const CATEGORY_VISUAL_ANCHORS: Record<string, string> = {
  crypto:        'glowing coin or price chart made of pixel blocks',
  markets:       'pixel stock ticker or falling/rising bar chart',
  money:         'overflowing pixel vault or stack of gold coins',
  hiphop:        'pixel turntable, microphone, or boombox',
  music:         'pixel speaker or vinyl record with bag motif',
  entertainment: 'pixel cinema screen or retro TV set',
  culture:       'pixel crowd or viral meme frame',
  tech:          'pixel computer or robot with bag antenna',
  sports_degen:  'pixel scoreboard or jersey with bag logo',
  general:       'pixel cityscape with bag floating above it',
};

const TRENDING_SCENE_SYSTEM = `You are a visual scene extractor for pixel art generation.
Given a trending topic and its category, describe ONE short visual scene (max 15 words) 
that captures the vibe of the topic through a Bagaverse lens.
The scene must be specific, visual, and slightly absurd.
Include the suggested visual anchor naturally in the scene.
Return ONLY the scene description, nothing else.`;

export async function extractTrendingScene(
  trendName: string,
  category: string
): Promise<string> {
  const anchor = CATEGORY_VISUAL_ANCHORS[category] ?? CATEGORY_VISUAL_ANCHORS.general;

  const res = await claude.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 60,
    system: TRENDING_SCENE_SYSTEM,
    messages: [{
      role: 'user',
      content: `Trending topic: "${trendName}"
Category: ${category}
Suggested visual anchor: ${anchor}

Describe a pixel art scene that captures this topic through a Bagaverse lens.`,
    }],
  });

  return res.content[0].type === 'text'
    ? res.content[0].text.trim()
    : `a ${anchor} surrounded by floating bags`;
}

// ── Convenience functions ─────────────────────────────────────────────────────

export async function generateTrendingPixelArt(
  trendName: string,
  category: string
): Promise<PixelArtResult> {
  const scene = await extractTrendingScene(trendName, category);
  return generatePixelArt(scene);
}

export async function generateBagTechPixelArt(
  tweetText: string
): Promise<PixelArtResult> {
  const scene = await extractBagTechScene(tweetText);
  return generatePixelArt(scene);
}
