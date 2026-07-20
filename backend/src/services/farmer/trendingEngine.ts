// ============================================
// Bags Bro! Trending Engine
// 1. Fetches US trending topics from X API
// 2. Scores/filters by category suitability
// 3. Enriches with NewsAPI headlines for context
// 4. Caches in MongoDB to avoid repeat charges
// ============================================

import { TwitterApi } from 'twitter-api-v2';
import { getDb } from '../../db/mongodb';

const NEWSAPI_KEY = process.env.NEWSAPI_KEY!;
const TREND_CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
const US_WOEID = 23424977;

// ── Category scoring ──────────────────────────────────────────────────────────

// Topics to hard-skip regardless of score
const HARD_SKIP_PATTERNS = [
  /\bdied?\b/i, /\bRIP\b/i, /\bpassing\b/i, /\btragedy\b/i, /\bdeath\b/i,
  /\bshooting\b/i, /\bmassacre\b/i, /\bdisaster\b/i, /\bearthquake\b/i,
  /\bhurricane\b/i, /\bflood\b/i, /\bterror\b/i, /\bgenocide\b/i,
  /\bsuicide\b/i, /\bcancer\b/i, /\bhospital\b/i, /\bfuneral\b/i,
  /\bwar\b/i, /\bmissile\b/i, /\bbombing\b/i,
  // Awards shows — too entertainment-specific, low brand fit
  /#?oscars?/i, /#?emmys?/i, /#?goldenglobes?/i,
  /#?bafta/i, /#?academyawards?/i, /#?redcarpet/i,
];

// High-value topic keywords by category
// Scores: crypto/tech/hiphop = 9-10, music = 7-8, entertainment/culture = 4-5 max
const TOPIC_SCORES: Array<{ pattern: RegExp; score: number; category: string }> = [
  // Crypto / Finance — highest priority, direct Bagaverse territory
  { pattern: /\bcrypto\b|\bbitcoin\b|\bbtc\b|\beth\b|\bsolana\b|\bnft\b|\bdefi\b|\bmemecoin\b/i, score: 10, category: 'crypto' },
  { pattern: /\bstock\b|\bmarket\b|\bfed\b|\brates\b|\binflation\b|\brecession\b|\bwall street\b/i, score: 9, category: 'markets' },
  { pattern: /\bbillionaire\b|\bmillionaire\b|\bwealth\b|\bmoney\b|\brich\b|\bbroke\b/i, score: 8, category: 'money' },

  // Tech / AI — raised to match crypto priority
  { pattern: /\bclaude\b|\banthropic\b|\bopenai\b|\bgpt\b|\bgemini\b|\bgrok\b|\bllm\b|\bai model\b/i, score: 10, category: 'tech' },
  { pattern: /\bartificial intelligence\b|\bmachine learning\b|\bchatbot\b|\bagents?\b|\bai\b/i, score: 9, category: 'tech' },
  { pattern: /\bapple\b|\bgoogle\b|\bmicrosoft\b|\bnvidia\b|\bstartup\b|\bfunding\b|\bvaluation\b|\bfounder\b|\bvc\b|\bipo\b/i, score: 8, category: 'tech' },
  { pattern: /\btech\b|\bsoftware\b|\bapp\b|\bplatform\b|\blaunch\b/i, score: 7, category: 'tech' },

  // Hip-Hop / Music — music-first project
  { pattern: /\bkendrick\b|\bdrak?e\b|\bjay.?z\b|\bkanye\b|\bcardi\b|\bnicki\b|\btravis scott\b/i, score: 9, category: 'hiphop' },
  { pattern: /\brap\b|\bhip.?hop\b|\balbum\b|\bdrop\b|\btrack\b|\bfreestyle\b|\bdiss\b/i, score: 8, category: 'hiphop' },
  { pattern: /\bplaylist\b|\bstreaming\b|\bspotify\b|\bcharts?\b|\bbillboard\b/i, score: 7, category: 'music' },
  { pattern: /\bmusic\b|\bartist\b|\bsingle\b|\btour\b|\bconcert\b/i, score: 6, category: 'music' },

  // Sports with degen angle
  { pattern: /\bbets?\b|\bgambling\b|\bodds\b|\bdraft\b|\btrade\b|\bcontract\b|\bsalary\b/i, score: 6, category: 'sports_degen' },

  // Pop culture / Entertainment — score 4, below minimum of 5, so never qualifies alone
  { pattern: /\bmovie\b|\bfilm\b|\btrailer\b|\bnetflix\b|\bhbo\b|\bbox office\b/i, score: 4, category: 'entertainment' },
  { pattern: /\bviral\b|\bmeme\b|\bcancel\b|\bcancelled\b/i, score: 3, category: 'culture' },
  { pattern: /\bcelebrity\b|\bbeef\b|\bdrama\b|\bexposed\b/i, score: 2, category: 'culture' },

  // People / names — score 1, never qualifies
  { pattern: /^#?[A-Z][a-z]+[A-Z][a-z]+|^#?[A-Z][a-z]+ [A-Z][a-z]+/i, score: 1, category: 'culture' },
];

interface ScoredTrend {
  name: string;
  tweetVolume: number | null;
  score: number;
  category: string;
  skip: boolean;
}

function scoreTrend(name: string, tweetVolume: number | null): ScoredTrend {
  // Hard skip check
  const skip = HARD_SKIP_PATTERNS.some(p => p.test(name));

  let score = 0;
  let category = 'general';

  for (const { pattern, score: s, category: c } of TOPIC_SCORES) {
    if (pattern.test(name)) {
      score = Math.max(score, s);
      category = c;
    }
  }

  // Volume bonus — trending hard = more eyeballs
  if (tweetVolume && tweetVolume > 100000) score += 2;
  else if (tweetVolume && tweetVolume > 50000) score += 1;

  return { name, tweetVolume, score, category, skip };
}

// ── NewsAPI enrichment ─────────────────────────────────────────────────────────

interface NewsContext {
  headline: string;
  description: string;
  source: string;
}

async function fetchNewsContext(topic: string): Promise<NewsContext[]> {
  try {
    const q = encodeURIComponent(topic.replace(/^#/, ''));
    const url = `https://newsapi.org/v2/everything?q=${q}&sortBy=publishedAt&pageSize=3&language=en&apiKey=${NEWSAPI_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json() as {
      articles: Array<{
        title: string;
        description: string;
        source: { name: string };
      }>;
    };

    return (data.articles || [])
      .filter(a => a.title && a.title !== '[Removed]')
      .slice(0, 3)
      .map(a => ({
        headline: a.title,
        description: a.description || '',
        source: a.source?.name || 'unknown',
      }));
  } catch (err: any) {
    console.error(`[TrendingEngine] NewsAPI failed for "${topic}":`, err.message);
    return [];
  }
}

// ── Cache helpers ─────────────────────────────────────────────────────────────

export interface TrendingTopic {
  name: string;
  tweetVolume: number | null;
  score: number;
  category: string;
  newsContext: NewsContext[];
  fetchedAt: Date;
}

async function getCachedTrends(): Promise<TrendingTopic[] | null> {
  const db = await getDb();
  const doc = await db.collection('trending_cache').findOne({ key: 'us_trends' });
  if (!doc) return null;

  const age = Date.now() - new Date(doc.fetchedAt).getTime();
  if (age > TREND_CACHE_TTL_MS) return null;

  return doc.trends as TrendingTopic[];
}

async function cacheTrends(trends: TrendingTopic[]): Promise<void> {
  const db = await getDb();
  await db.collection('trending_cache').updateOne(
    { key: 'us_trends' },
    { $set: { key: 'us_trends', trends, fetchedAt: new Date() } },
    { upsert: true }
  );
}

// ── Main fetch ────────────────────────────────────────────────────────────────

export async function fetchTrendingTopics(forceRefresh = false): Promise<TrendingTopic[]> {
  // Check cache first
  if (!forceRefresh) {
    const cached = await getCachedTrends();
    if (cached) {
      console.log(`[TrendingEngine] Returning ${cached.length} cached trends`);
      return cached;
    }
  }

  console.log('[TrendingEngine] Fetching fresh trends from X API...');

  const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);
  const db = await getDb();

  let rawTrends: Array<{ name: string; tweet_volume: number | null }> = [];
  let fetchError: string | null = null;

  try {
    const res = await client.v2.get(`trends/by/woeid/${US_WOEID}`) as {
      data?: Array<{ trend_name: string; tweet_count?: number }>;
    };
    rawTrends = (res.data ?? []).map(t => ({
      name: t.trend_name,
      tweet_volume: t.tweet_count ?? null,
    }));
  } catch (err: any) {
    fetchError = err.message;
    console.error('[TrendingEngine] X trends fetch failed:', err.message);

    // Save diagnostics with error
    await db.collection('trending_diagnostics').updateOne(
      { key: 'last_fetch' },
      { $set: { key: 'last_fetch', error: fetchError, rawCount: 0, qualifiedCount: 0, allScored: [], fetchedAt: new Date() } },
      { upsert: true }
    );
    return [];
  }

  // Score all trends (including rejected ones for diagnostics)
  const allScored = rawTrends.map(t => scoreTrend(t.name, t.tweet_volume));
  const qualifiedScored = allScored
    .filter(t => !t.skip && t.score >= 5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  const rejected = allScored.filter(t => t.skip || t.score < 5);

  // Enrich qualified X trends with news context immediately
  const qualifiedEnriched: TrendingTopic[] = await Promise.all(
    qualifiedScored.map(async t => ({
      name: t.name,
      tweetVolume: t.tweetVolume,
      score: t.score,
      category: t.category,
      newsContext: await fetchNewsContext(t.name),
      fetchedAt: new Date(),
    }))
  );

  // ── Supplement with curated NewsAPI topics if X trends are thin ──────────
  const supplemented: TrendingTopic[] = [...qualifiedEnriched];
  if (supplemented.length < 3 && NEWSAPI_KEY) {
    try {
      const categories = [
        { q: 'artificial intelligence OR AI model OR OpenAI OR Anthropic OR Claude AI', category: 'tech' },
        { q: 'hip hop music OR rap album OR new music release OR streaming', category: 'hiphop' },
        { q: 'cryptocurrency OR bitcoin OR NFT OR web3', category: 'crypto' },
      ];

      for (const { q, category } of categories) {
        if (supplemented.length >= 5) break;
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&sortBy=popularity&pageSize=3&language=en&apiKey=${NEWSAPI_KEY}`;
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json() as { articles: Array<{ title: string; description: string; source: { name: string } }> };

        for (const article of (data.articles ?? []).slice(0, 2)) {
          if (supplemented.length >= 5) break;
          const topicName = article.title.split(/[:|–\-]/)[0].trim().slice(0, 60);
          if (supplemented.some(t => t.name === topicName)) continue;

          supplemented.push({
            name: topicName,
            tweetVolume: null,
            score: 7,
            category,
            newsContext: [{
              headline: article.title,
              description: article.description ?? '',
              source: article.source.name,
            }],
            fetchedAt: new Date(),
          });
          console.log(`[TrendingEngine] Supplemented with curated topic: "${topicName}" (${category})`);
        }
      }
    } catch (err: any) {
      console.warn('[TrendingEngine] Curated supplement failed:', err.message);
    }
  }

  // Save full diagnostics
  await db.collection('trending_diagnostics').updateOne(
    { key: 'last_fetch' },
    {
      $set: {
        key: 'last_fetch',
        error: null,
        rawCount: rawTrends.length,
        qualifiedCount: supplemented.length,
        qualified: supplemented.map(t => ({ name: t.name, score: t.score, category: t.category, volume: t.tweetVolume })),
        rejected: rejected.slice(0, 20).map(t => ({ name: t.name, score: t.score, skip: t.skip, volume: t.tweetVolume })),
        fetchedAt: new Date(),
      },
    },
    { upsert: true }
  );

  // Always write to cache — even empty results clear stale data
  await cacheTrends(supplemented);

  if (supplemented.length === 0) {
    console.log(`[TrendingEngine] No qualifying trends found (${rawTrends.length} raw, all filtered)`);
    return [];
  }

  console.log(`[TrendingEngine] Fetched and cached ${supplemented.length} qualifying trends`);
  return supplemented;
}

// ── Pick one trend for a post ─────────────────────────────────────────────────

export async function pickTrendForPost(): Promise<TrendingTopic | null> {
  const trends = await fetchTrendingTopics();
  if (trends.length === 0) return null;

  // Weight by score, slight randomness so we don't always use #1
  const total = trends.reduce((s, t) => s + t.score, 0);
  let rand = Math.random() * total;
  for (const trend of trends) {
    rand -= trend.score;
    if (rand <= 0) return trend;
  }
  return trends[0];
}

export async function getTrendingStatus(): Promise<{
  diagnostics: Record<string, unknown> | null;
  cachedTrends: TrendingTopic[] | null;
}> {
  const db = await getDb();
  const [diagnostics, cachedTrends] = await Promise.all([
    db.collection('trending_diagnostics').findOne({ key: 'last_fetch' }),
    getCachedTrends(),
  ]);
  return {
    diagnostics: diagnostics ? { ...diagnostics, _id: undefined } : null,
    cachedTrends,
  };
}
