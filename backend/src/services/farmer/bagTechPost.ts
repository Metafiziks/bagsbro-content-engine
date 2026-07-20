// lib/farmer/bagTechPost.ts
// Generates the weekly "absurd bag tech" post type:
// 1. Claude Haiku generates fake tech announcement copy
// 2. Claude extracts a visual scene for image gen
// 3. GPT-Image-1 generates 8-bit pixel art
// 4. Returns content + image buffer ready for Twitter upload

import Anthropic from '@anthropic-ai/sdk';
import { getDb } from '../../db/mongodb';
import { generateBagTechPixelArt } from './pixelArt';

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Prompt Templates ────────────────────────────────────────────────────────

const BAG_TECH_SYSTEM = `You are BagsBro, the chaotic degen philosopher of the Bagaverse.
You write absurd fake technology announcements that sound exactly like real Silicon Valley/crypto 
startup announcements, but filtered entirely through the lens of bags, blickeys, and bagonomics.

Voice rules:
- Sounds exactly like a real product launch tweet (technical jargon, bullet points, fake metrics)
- The "technology" must be completely absurd but described with total confidence
- MUST tie to bags, blickeys, the bagaverse, or bagonomics in a natural way
- AI angle is a bonus but not required every time
- NO token mentions, NO ticker symbols, NO price predictions (X suppresses this)
- NO tagging real accounts
- 3-5 bullet points with emoji, each one more unhinged than the last
- End with ONE punchy line. No call to action.
- Max 260 characters INCLUDING the bullet points
- Lowercase preferred, casual but confident
- DO NOT include hashtags`;

// ─── Topic seeds for variety ─────────────────────────────────────────────────

const TECH_TOPICS = [
  'bag-powered quantum computing that runs on the heat of unrecognized potential',
  'an AI model trained exclusively on bag acquisition patterns and missed opportunities',
  'a decentralized protocol for converting FUD directly into bag energy',
  'a neural interface that lets you feel the weight of unrealized gains',
  'a satellite network that detects bag opportunities from orbit using vibrational analysis',
  'a biotech startup that has sequenced the DNA of the perfect bag holder',
  'a spatial computing headset that overlays bag value on every physical object you see',
  'a robotics company that automates the process of not fumbling bags',
  'an observatory that tracks the gravitational pull of generational wealth',
  'a climate tech company that converts market volatility directly into renewable bag energy',
  'a materials science breakthrough: a fabric woven from pure accumulated bag theory',
  'an autonomous vehicle that only drives toward bag opportunities and refuses all other routes',
];

// ─── Main function ────────────────────────────────────────────────────────────

export interface BagTechPost {
  tweetText: string;
  imageBuffer: Buffer;
  imageDescription: string;
  topicUsed: string;
}

export async function generateBagTechPost(): Promise<BagTechPost> {
  // 1. Pick a random topic seed
  const topic = TECH_TOPICS[Math.floor(Math.random() * TECH_TOPICS.length)];

  const db = await getDb();
  const lingoEntries = await db.collection('lingo')
    .find({ active: true })
    .sort({ weight: -1 })
    .limit(15)
    .project({ term: 1, definition: 1 })
    .toArray();

  const lingoDictionary = lingoEntries
    .map((l) => `${l.term}: ${l.definition}`)
    .join('\n');

  // 3. Generate tweet copy with Claude Haiku
  const copyResponse = await claude.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    system: BAG_TECH_SYSTEM,
    messages: [
      {
        role: 'user',
        content: `Write a fake tech announcement tweet about: ${topic}

Bagaverse lingo to naturally weave in (use 1-2 max, don't force it):
${lingoDictionary}

Remember: no tokens, no tickers, no real account tags. Just vibes and bags.`,
      },
    ],
  });

  const tweetText =
    copyResponse.content[0].type === 'text'
      ? copyResponse.content[0].text.trim()
      : '';

  if (!tweetText) throw new Error('Claude returned empty tweet copy');

  // 4. Generate pixel art via shared utility
  const { imageBuffer, imageDescription } = await generateBagTechPixelArt(tweetText);

  return {
    tweetText,
    imageBuffer,
    imageDescription,
    topicUsed: topic,
  };
}

// ─── Preview helper (for testing without posting) ─────────────────────────────

export async function previewBagTechPost(): Promise<{
  tweetText: string;
  imageDescription: string;
  topicUsed: string;
  imageBase64: string;
}> {
  const topic = TECH_TOPICS[Math.floor(Math.random() * TECH_TOPICS.length)];

  const db = await getDb();
  const lingoEntries = await db.collection('lingo')
    .find({ active: true })
    .sort({ weight: -1 })
    .limit(15)
    .project({ term: 1, definition: 1 })
    .toArray();

  const lingoDictionary = lingoEntries
    .map((l) => `${l.term}: ${l.definition}`)
    .join('\n');

  const copyResponse = await claude.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    system: BAG_TECH_SYSTEM,
    messages: [
      {
        role: 'user',
        content: `Write a fake tech announcement tweet about: ${topic}\n\nBagaverse lingo:\n${lingoDictionary}`,
      },
    ],
  });

  const tweetText =
    copyResponse.content[0].type === 'text'
      ? copyResponse.content[0].text.trim()
      : '';

  const { imageBuffer, imageDescription } = await generateBagTechPixelArt(tweetText);

  return {
    tweetText,
    imageDescription,
    topicUsed: topic,
    imageBase64: imageBuffer.toString('base64'),
  };
}
