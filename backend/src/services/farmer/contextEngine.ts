// ============================================
// Bags Bro! Context Engine
// Dynamically assembles Claude prompts from
// MongoDB instead of hardcoded strings.
//
// Every generation call gets exactly the
// context it needs — no more, no less.
// ============================================

import { getDb } from '../../db/mongodb';

// ── Types ─────────────────────────────────────────────────────────────────────

export type PostType = 'hot_take' | 'shitpost' | 'nft_image' | 'gif' | 'mp4' | 'trending';
export type AudienceSegment = 'crypto' | 'hiphop' | 'collectors' | 'general';

interface LingoEntry {
  term: string;
  definition: string;
  examples: string[];
  usageContext: string[];
  tags: string[];       // e.g. ['crypto', 'hiphop', 'general']
  weight: number;
  active: boolean;
}

interface PostTopic {
  text: string;         // the topic seed itself
  category: string;     // 'crypto' | 'hiphop' | 'culture' | 'general' etc.
  active: boolean;
  usageCount: number;
  lastUsed: Date | null;
}

interface VoiceConfig {
  key: string;          // e.g. 'persona', 'hard_rules', 'hot_take_patterns'
  value: string;
  active: boolean;
}

// ── Cache (5 min TTL — avoids hammering DB on every post) ─────────────────────

interface CacheEntry<T> { data: T; expiresAt: number; }
const cache = new Map<string, CacheEntry<unknown>>();

function fromCache<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry || Date.now() > entry.expiresAt) return null;
  return entry.data;
}

function toCache<T>(key: string, data: T, ttlMs = 5 * 60 * 1000): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export function clearContextCache(): void {
  cache.clear();
}

// ── Data fetchers ─────────────────────────────────────────────────────────────

async function getVoiceConfig(): Promise<Record<string, string>> {
  const cached = fromCache<Record<string, string>>('voice_config');
  if (cached) return cached;

  const db = await getDb();
  const entries = await db.collection<VoiceConfig>('voice_config')
    .find({ active: true })
    .toArray();

  const config: Record<string, string> = {};
  for (const e of entries) config[e.key] = e.value;

  toCache('voice_config', config);
  return config;
}

async function getLingo(tags?: string[], limit = 5): Promise<LingoEntry[]> {
  const cacheKey = `lingo_${tags?.join('_') ?? 'all'}_${limit}`;
  const cached = fromCache<LingoEntry[]>(cacheKey);
  if (cached) return cached;

  const db = await getDb();
  const query: Record<string, unknown> = { active: true };
  if (tags?.length) query.tags = { $in: tags };

  // Prefer terms used less recently for variety
  const entries = await db.collection<LingoEntry>('lingo')
    .find(query)
    .sort({ usageCount: 1 })
    .limit(limit * 3) // fetch more, then sample
    .toArray();

  // Random sample from candidates for variety
  const shuffled = entries.sort(() => Math.random() - 0.5).slice(0, limit);
  toCache(cacheKey, shuffled, 2 * 60 * 1000); // 2 min TTL for variety
  return shuffled;
}

async function getTopics(category?: string, limit = 5): Promise<PostTopic[]> {
  const cacheKey = `topics_${category ?? 'all'}`;
  const cached = fromCache<PostTopic[]>(cacheKey);
  if (cached) return cached;

  const db = await getDb();
  const query: Record<string, unknown> = { active: true };
  if (category) query.category = category;

  const cooldownCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
  query.$or = [{ lastUsed: null }, { lastUsed: { $lt: cooldownCutoff } }];

  const topics = await db.collection<PostTopic>('post_topics')
    .find(query)
    .sort({ usageCount: 1, lastUsed: 1 })
    .limit(limit * 2)
    .toArray();

  const shuffled = topics.sort(() => Math.random() - 0.5).slice(0, limit);
  toCache(cacheKey, shuffled, 2 * 60 * 1000);
  return shuffled;
}

export async function markTopicUsed(topicText: string): Promise<void> {
  const db = await getDb();
  await db.collection('post_topics').updateOne(
    { text: topicText },
    { $inc: { usageCount: 1 }, $set: { lastUsed: new Date() } }
  );
  cache.delete('topics_all');
  cache.delete('topics_crypto');
  cache.delete('topics_hiphop');
  cache.delete('topics_culture');
  cache.delete('topics_general');
}

// ── Capitalization style ──────────────────────────────────────────────────────

function capStyle(): string {
  const roll = Math.random();
  if (roll < 0.45) return 'Write in all lowercase — no capitals anywhere, including first word';
  if (roll < 0.80) return 'Write with normal sentence capitalization — capitalize first word only';
  return 'Write in all lowercase except proper nouns and the very first word';
}

// ── Lingo formatter ───────────────────────────────────────────────────────────

function formatLingoBlock(entries: LingoEntry[]): string {
  if (entries.length === 0) return '';
  const lines = entries.map(e => {
    const example = e.examples?.[0] ? `\n   e.g. "${e.examples[0]}"` : '';
    return `- ${e.term}: ${e.definition}${example}`;
  });
  return `AVAILABLE LINGO (use at most 1, only if natural — never forced):\n${lines.join('\n')}`;
}

// ── Context assemblers ────────────────────────────────────────────────────────
// One function per post type. Each returns a complete prompt string.

export async function buildHotTakeContext(gifName?: string): Promise<{
  prompt: string;
  topic: string;
}> {
  const [config, topics, lingo] = await Promise.all([
    getVoiceConfig(),
    getTopics(undefined, 5),
    getLingo(['crypto', 'hiphop', 'general'], 4),
  ]);

  const topic = topics[0]?.text ?? 'the gap between people who secure bags and people who watch';
  const lingoBlock = formatLingoBlock(lingo);
  const patterns = config['hot_take_patterns'] ?? '';
  const gifCtx = gifName
    ? `\nA GIF called "${gifName}" accompanies this post. Let it subtly shape the energy — don't reference it directly.`
    : '';

  const prompt = `${config['persona'] ?? ''}
${config['hard_rules'] ?? ''}
${capStyle()}

${lingoBlock}

${patterns ? `HOT TAKE PATTERNS:\n${patterns}\n` : ''}
Write a hot take tweet about: "${topic}"${gifCtx}

Rules:
- Be a genuine (if absurd) opinion or observation
- Connect to bag/Bagaverse energy naturally
- Sound like a real person, not a bot
- NEVER start with "Most people", "The truth is", "Hot take:", "Unpopular opinion"
- Start with something unexpected — a statement, scenario, or observation

Respond with ONLY the tweet text. No quotes.`;

  return { prompt, topic };
}

export async function buildShitpostContext(): Promise<string> {
  const [config, lingo] = await Promise.all([
    getVoiceConfig(),
    getLingo(['general'], 2),
  ]);

  const formats = config['shitpost_formats']
    ? config['shitpost_formats'].split('\n').filter(Boolean)
    : [
        'multi-line internal monologue (3am vibes, checking prices, markets)',
        'hot take with zero evidence but full confidence',
        'extremely relatable degen scenario',
        'fake deep philosophical observation about holding',
        'absurdist comparison between something mundane and bag energy',
      ];

  const format = formats[Math.floor(Math.random() * formats.length)];
  const lingoBlock = formatLingoBlock(lingo);

  return `${config['persona'] ?? ''}
${config['hard_rules'] ?? ''}
${capStyle()}

${lingoBlock}

Write a shitpost tweet using this format: "${format}"

Rules:
- Pure vibes, no agenda
- Can use line breaks for effect
- Should make someone laugh or nod
- NOT trying too hard

Respond with ONLY the tweet text.`;
}

export async function buildTrendingContext(
  trendName: string,
  category: string,
  newsContext: Array<{ headline: string; source: string }>
): Promise<string> {
  // Pull audience-specific lingo based on trend category
  const lingoTags = category === 'crypto' || category === 'markets'
    ? ['crypto', 'general']
    : category === 'hiphop' || category === 'music'
    ? ['hiphop', 'general']
    : ['general'];

  const [config, lingo] = await Promise.all([
    getVoiceConfig(),
    getLingo(lingoTags, 3),
  ]);

  const categoryHints: Record<string, string> = {
    crypto:        'Full Bagaverse territory — riff on the bag implications.',
    markets:       'Translate entirely into bag energy. What do the bags think?',
    money:         'Classic bag deflection. The bags have always known.',
    hiphop:        'Music-first reaction. React like a fan who is also a bag philosopher.',
    music:         'Connect to the bag frequency. Great music is bagonomics expressed sonically.',
    entertainment: 'Use as a springboard. The Bagaverse has opinions on everything.',
    culture:       'React from the Bagaverse lens. Keep it light and absurdist.',
    tech:          'Translate into bag implications. What does this mean for bag holders?',
    sports_degen:  'Pure degen territory. Bags were wagered. Bags were lost.',
    general:       'Find the bag angle no matter what.',
  };

  const hint = categoryHints[category] ?? categoryHints.general;
  const newsBlock = newsContext.length > 0
    ? `\nWhat's happening:\n${newsContext.map(n => `- ${n.headline} (${n.source})`).join('\n')}`
    : '';
  const lingoBlock = formatLingoBlock(lingo);

  return `${config['persona'] ?? ''}
${config['hard_rules'] ?? ''}
${capStyle()}

${lingoBlock}

Trending: "${trendName}"${newsBlock}
Context: ${hint}

Write a tweet that:
- Uses this trend as a SPRINGBOARD, not the main subject
- Deflects everything through the Bagaverse lens — absurdist, confident, funny
- Does NOT summarize the news or give a straight opinion
- Sounds like a real person riffing, not a bot reacting
- Max 220 characters

Respond with ONLY the tweet text.`;
}

export async function buildNftCaptionContext(): Promise<string> {
  const [config, lingo] = await Promise.all([
    getVoiceConfig(),
    getLingo(['general'], 2),
  ]);

  const lingoBlock = formatLingoBlock(lingo);

  return `${config['persona'] ?? ''}
${config['hard_rules'] ?? ''}
${capStyle()}

${lingoBlock}

Write a caption for posting a Bags Bro! Ballers NFT image.

Rules:
- Hype the NFT naturally, not try-hard
- Under 150 chars preferred
- Sound like a proud holder, not a marketer
- Can reference "this little guy" or similar character language

Respond with ONLY the caption text.`;
}

export async function buildMp4CaptionContext(mediaName?: string): Promise<string> {
  const [config, lingo] = await Promise.all([
    getVoiceConfig(),
    getLingo(['hiphop', 'general'], 2),
  ]);

  const lingoBlock = formatLingoBlock(lingo);

  return `${config['persona'] ?? ''}
${config['hard_rules'] ?? ''}
${capStyle()}

${lingoBlock}

Write a caption for a Bags Bro! video clip${mediaName ? ` called "${mediaName}"` : ''}.

Rules:
- Short and punchy (under 120 chars)
- Hype the energy without being salesy
- Feel like something a real person posts with a video
- Can be funny, hype, or cryptically degen

Respond with ONLY the caption text.`;
}

// ── Seed function ─────────────────────────────────────────────────────────────
// Call once to populate voice_config and post_topics from scratch.
// Safe to re-run — uses upsert so it won't duplicate.

export async function seedContextCollections(): Promise<void> {
  const db = await getDb();

  // ── voice_config ────────────────────────────────────────────────────────────
  const voiceEntries: VoiceConfig[] = [
    {
      key: 'persona',
      active: true,
      value: `You are BagsBro, the voice of Bags Bro! — a music-first creative project rooted in hip-hop culture and the philosophy of the Bagaverse.

PERSONALITY:
- Chaotic degen philosopher. Music head. Bag theorist. Full Bagaverse citizen.
- Hip-hop native, crypto-fluent, extremely online
- Speaks with total conviction about absurd things
- Self-aware humor, never cringe-sincere, never corny
- The bags are a philosophy, not just money — acquiring bags means acquiring everything: knowledge, culture, connections, wealth, vibes
- Warmly calls community "baggies"`,
    },
    {
      key: 'hard_rules',
      active: true,
      value: `HARD RULES (never break these):
- Max 240 characters
- NO hashtags ever (screams bot)
- NO @ mentions in standalone posts
- NO "gm", "LFG", "ser", "fren" (overused and corny)
- NO NFT minting/project promotion language
- NO "mint", "floor price", "opensea", "collection dropping"
- NO em dashes (—) — use comma, period, or line break instead
- NO ellipsis character (…) — use ... if needed
- 0-2 emojis max, only if genuinely adds to the post
- Never start two posts in a row with same word`,
    },
    {
      key: 'hot_take_patterns',
      active: true,
      value: `Pattern 1 — The Assertion: State the take. Nothing else.
Pattern 2 — Assertion + Brief Support: State the take. One sentence of evidence.
Pattern 3 — Observation + Bagaverse Reframe: Notice something, translate through bag logic.
Pattern 4 — The Callback: Build to a lingo term as the closer, not the opener.`,
    },
    {
      key: 'shitpost_formats',
      active: true,
      value: `multi-line internal monologue (3am vibes, checking prices, refreshing apps)
hot take with zero evidence but full confidence
extremely relatable degen scenario
fake deep philosophical observation about the bag
absurdist comparison between something mundane and bag energy
deadpan observation that would be unremarkable in conversation but lands on X`,
    },
  ];

  for (const entry of voiceEntries) {
    await db.collection('voice_config').updateOne(
      { key: entry.key },
      { $set: entry },
      { upsert: true }
    );
  }
  console.log(`[ContextEngine] Seeded ${voiceEntries.length} voice_config entries`);

  // ── post_topics ──────────────────────────────────────────────────────────────
  const topics: Omit<PostTopic, 'usageCount' | 'lastUsed'>[] = [
    // crypto
    { text: 'the gap between people who secure bags and people who watch others secure bags', category: 'crypto', active: true },
    { text: 'the psychology behind bag blocking and why broke people do it most', category: 'crypto', active: true },
    { text: 'the difference between bag energy and bag desperation', category: 'crypto', active: true },
    { text: 'real bag theory being about patience, not hustle', category: 'crypto', active: true },
    { text: 'the economy designed to punish people who think like bag theorists', category: 'crypto', active: true },
    { text: 'generational bags vs. spending everything and starting over every year', category: 'crypto', active: true },
    { text: 'trading time for money vs. building something that pays while you sleep', category: 'crypto', active: true },
    // hiphop
    { text: 'hip-hop understanding bagonomics before wall street ever did', category: 'hiphop', active: true },
    { text: 'independent artists owning masters being worth more than any advance', category: 'hiphop', active: true },
    { text: 'streaming numbers meaning nothing if you don\'t own the publishing', category: 'hiphop', active: true },
    { text: 'sleeping on independent artists before they blow — the ultimate bag fumble', category: 'hiphop', active: true },
    { text: 'loyalty to a sound before it blows being the ultimate bag move', category: 'hiphop', active: true },
    { text: 'sample clearances and royalties being the most slept-on bag conversation', category: 'hiphop', active: true },
    // culture
    { text: 'creative output and its direct relationship to bag accumulation', category: 'culture', active: true },
    { text: 'chronically underpaid creative people and why that era is ending', category: 'culture', active: true },
    { text: 'AI exposing who actually had taste and vision vs. who was just following', category: 'culture', active: true },
    // general
    { text: 'the difference between looking busy and actually securing', category: 'general', active: true },
    { text: 'most people confusing activity with progress', category: 'general', active: true },
    { text: 'bag protection being just as important as bag acquisition', category: 'general', active: true },
  ];

  for (const topic of topics) {
    await db.collection('post_topics').updateOne(
      { text: topic.text },
      { $set: topic, $setOnInsert: { usageCount: 0, lastUsed: null } },
      { upsert: true }
    );
  }
  console.log(`[ContextEngine] Seeded ${topics.length} post_topics`);

  // ── Add tags to existing lingo entries ───────────────────────────────────────
  // Tag each existing lingo term so they can be filtered by audience
  const lingoTags: Record<string, string[]> = {
    'BM':              ['general', 'hiphop', 'crypto'],
    'BLICKIES':        ['crypto'],
    'Bagonomics':      ['crypto', 'general'],
    'Bagsbrophysics':  ['general', 'culture'],
    'Baggadocious':    ['hiphop', 'culture'],
    'Baggish':         ['general'],
    'Baggamistic':     ['crypto', 'general'],
    'Bag Magic':       ['general', 'culture'],
    'Bagsplaining':    ['general', 'hiphop'],
    'Bag Blocking':    ['crypto', 'general'],
    'Begen':           ['general'],
    'Lollybagging':    ['general'],
    'Mind Ya Bagness': ['general', 'hiphop'],
    'The Big Bag Theory': ['general', 'culture'],
    'Bag Szn':         ['crypto', 'general'],
    'Bag Secured':     ['general', 'hiphop', 'crypto'],
    'Bag Hole':        ['crypto', 'general'],
  };

  let taggedCount = 0;
  for (const [term, tags] of Object.entries(lingoTags)) {
    const result = await db.collection('lingo').updateOne(
      { term: { $regex: new RegExp(`^${term}$`, 'i') } },
      { $set: { tags } }
    );
    if (result.matchedCount > 0) taggedCount++;
  }
  console.log(`[ContextEngine] Tagged ${taggedCount} lingo entries`);

  console.log('[ContextEngine] ✅ Seed complete');
}
