// ============================================
// Bags Bro! Scheduler
// Human-mimicking post timing with gaussian
// distribution, jitter, skip days, and sleep
// periods. Runs as a continuous loop on Cloud Run.
// ============================================

import { getDb } from '../../db/mongodb';
import { publishPost } from './postEngine';
import { runReplyEngine } from './replyEngine';
import { generateDailyQueue } from './queueEngine';

// ---- Timing constants (all times in ms) ----
const REPLY_CHECK_INTERVAL  = 45 * 60 * 1000;            // 45 min
const SLEEP_START_HOUR      = 0;   // midnight ET
const SLEEP_END_HOUR        = 8;   // 8am ET
const SKIP_DAY_PROBABILITY  = 0.12; // ~1 day in 8

// Broad active zones — posts land freely within each zone at random minutes.
const POST_ZONES = [
  { start: 8,  end: 11, weight: 20 },   // morning
  { start: 11, end: 14, weight: 25 },   // midday
  { start: 14, end: 17, weight: 20 },   // afternoon
  { start: 17, end: 20, weight: 25 },   // evening
  { start: 20, end: 24, weight: 20 },   // night (up to midnight)
];

function jitterMs(baseMs: number, pct = 0.3): number {
  return baseMs + Math.floor((Math.random() * 2 - 1) * baseMs * pct);
}

function weightedPick<T extends { weight: number }>(items: T[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let rand = Math.random() * total;
  for (const item of items) {
    rand -= item.weight;
    if (rand <= 0) return item;
  }
  return items[items.length - 1];
}

function nowHourET(): number {
  return new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    hour12: false,
  }) as unknown as number;
}

function isSleepTime(): boolean {
  const h = Number(nowHourET());
  return h >= SLEEP_START_HOUR && h < SLEEP_END_HOUR;
}

function msUntilWakeup(): number {
  const now = new Date();
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const wake = new Date(et);
  wake.setHours(SLEEP_END_HOUR, 0, 0, 0);
  if (et.getHours() >= SLEEP_END_HOUR) wake.setDate(wake.getDate() + 1);
  return jitterMs(wake.getTime() - et.getTime(), 0.1);
}

// ---- Daily schedule generator ----

interface ScheduledPost {
  fireAt: Date;
  fired: boolean;
}

export function generateDailySchedule(): ScheduledPost[] {
  if (Math.random() < SKIP_DAY_PROBABILITY) {
    console.log('[Scheduler] Skip day — no posts scheduled today');
    return [];
  }

  // 3-6 posts per day with variable weighting
  const countWeights = [
    { count: 3, weight: 15 },
    { count: 4, weight: 35 },
    { count: 5, weight: 30 },
    { count: 6, weight: 20 },
  ];
  const count = weightedPick(countWeights).count;

  const posts: ScheduledPost[] = [];
  const usedZones = new Set<number>();

  for (let i = 0; i < count; i++) {
    // Pick a zone, allowing reuse after all zones are exhausted
    let zone: typeof POST_ZONES[0];
    let attempts = 0;
    do {
      zone = weightedPick(POST_ZONES);
      attempts++;
    } while (
      attempts < 15 &&
      usedZones.size < POST_ZONES.length &&
      usedZones.has(POST_ZONES.indexOf(zone))
    );

    usedZones.add(POST_ZONES.indexOf(zone));

    // Pick a completely random minute within the zone
    const zoneMinutes = (zone.end - zone.start) * 60;
    const randomMinutesInZone = Math.floor(Math.random() * zoneMinutes);
    const totalMinutesFromMidnight = zone.start * 60 + randomMinutesInZone;
    const hour = Math.floor(totalMinutesFromMidnight / 60);
    const minute = totalMinutesFromMidnight % 60;

    const now = new Date();
    const fireAt = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    fireAt.setHours(hour, minute, 0, 0);

    if (fireAt <= now) fireAt.setDate(fireAt.getDate() + 1);
    posts.push({ fireAt, fired: false });
  }

  // Sort by time and enforce a minimum 90-minute gap between posts
  posts.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime());

  const minGapMs = 90 * 60 * 1000;
  for (let i = 1; i < posts.length; i++) {
    const gap = posts[i].fireAt.getTime() - posts[i - 1].fireAt.getTime();
    if (gap < minGapMs) {
      posts[i].fireAt = new Date(posts[i - 1].fireAt.getTime() + minGapMs +
        Math.floor(Math.random() * 30 * 60 * 1000)); // push forward + up to 30 extra min
    }
  }

  console.log(`[Scheduler] Today's schedule (${count} posts):`);
  posts.forEach(p => console.log(`  → ${p.fireAt.toLocaleTimeString('en-US', { timeZone: 'America/New_York' })}`));

  return posts;
}

// ---- Save/load schedule state ----

async function saveScheduleState(schedule: ScheduledPost[]): Promise<void> {
  const db = await getDb();
  await db.collection('scheduler_state').updateOne(
    { key: 'daily_schedule' },
    {
      $set: {
        schedule: schedule.map(s => ({ fireAt: s.fireAt, fired: s.fired })),
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}

async function logSchedulerEvent(event: string, meta?: Record<string, unknown>): Promise<void> {
  const db = await getDb();
  await db.collection('scheduler_log').insertOne({
    event,
    meta: meta ?? null,
    timestamp: new Date(),
  });
}

// ---- Main scheduler loop ----

export async function startScheduler(): Promise<void> {
  console.log('[Scheduler] Starting Bags Bro! Engagement Farmer 🛍️');

  let schedule: ScheduledPost[] = [];
  let lastReplyCheckAt = 0;
  let currentDay = new Date().toDateString();
  let lastQueueGenDate = ''; // tracks which date's queue has been generated

  while (true) {
    try {
      const now = new Date();
      const hourET = Number(nowHourET());
      const dateET = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const todayDateStr = dateET.toDateString();

      // ── Midnight queue generation ─────────────────────────────────────────
      // At midnight ET, generate tomorrow's post queue so it's ready to review
      // by the time you wake up. Runs once per day.
      if (hourET === 0 && lastQueueGenDate !== todayDateStr) {
        lastQueueGenDate = todayDateStr;
        console.log('[Scheduler] Midnight — generating tomorrow\'s post queue');
        setImmediate(async () => {
          try {
            // Build tomorrow's schedule slots to pass to queue generator
            const tomorrowSchedule = generateDailySchedule();
            const slots = tomorrowSchedule.map(s => ({ fireAt: s.fireAt }));
            await generateDailyQueue(slots, false); // false = don't force-replace existing
            await logSchedulerEvent('midnight_queue_generated', { slots: slots.length });
            console.log(`[Scheduler] ✅ Queue generated: ${slots.length} posts for tomorrow`);
          } catch (err: any) {
            console.error('[Scheduler] Midnight queue generation failed:', err.message);
          }
        });
      }

      // Sleep period check
      if (isSleepTime()) {
        const sleepMs = msUntilWakeup();
        console.log(`[Scheduler] Sleeping until ~8am ET (${Math.round(sleepMs / 3600000)}h)`);
        await logSchedulerEvent('sleep', { wakeAt: new Date(Date.now() + sleepMs) });
        await new Promise(r => setTimeout(r, sleepMs));
        continue;
      }

      // New day — generate fresh schedule
      if (now.toDateString() !== currentDay) {
        currentDay = now.toDateString();
        schedule = generateDailySchedule();
        await saveScheduleState(schedule);
        await logSchedulerEvent('new_day_schedule', { count: schedule.length });
      }

      // First run of the day — generate schedule if empty
      if (schedule.length === 0 && !isSleepTime()) {
        schedule = generateDailySchedule();
        await saveScheduleState(schedule);
      }

      // Check if any posts are due
      for (const post of schedule) {
        if (post.fired) continue;

        const msSinceScheduled = now.getTime() - post.fireAt.getTime();

        // Skip posts that are more than 30 minutes overdue — avoids batch firing on wakeup
        if (msSinceScheduled > 30 * 60 * 1000) {
          console.log(`[Scheduler] Skipping stale post scheduled for ${post.fireAt.toLocaleTimeString('en-US', { timeZone: 'America/New_York' })} (${Math.round(msSinceScheduled / 60000)}min overdue)`);
          post.fired = true;
          await saveScheduleState(schedule);
          await logSchedulerEvent('post_skipped_stale', { scheduledFor: post.fireAt, minsOverdue: Math.round(msSinceScheduled / 60000) });
          continue;
        }

        if (now >= post.fireAt) {
          console.log(`[Scheduler] Firing scheduled post (${post.fireAt.toLocaleTimeString('en-US', { timeZone: 'America/New_York' })})`);
          post.fired = true;
          await saveScheduleState(schedule);
          const success = await publishPost();
          await logSchedulerEvent('post_fired', { success, scheduledFor: post.fireAt });
        }
      }

      // Reply engine check (every 45 min during active hours)
      const msSinceReplyCheck = Date.now() - lastReplyCheckAt;
      if (msSinceReplyCheck >= jitterMs(REPLY_CHECK_INTERVAL)) {
        console.log('[Scheduler] Running reply engine cycle');
        lastReplyCheckAt = Date.now();
        await runReplyEngine().catch(err =>
          console.error('[Scheduler] Reply engine error:', err.message)
        );
        await logSchedulerEvent('reply_cycle');
      }

      // Check every 2 minutes
      await new Promise(r => setTimeout(r, 2 * 60 * 1000));

    } catch (err: any) {
      console.error('[Scheduler] Loop error:', err.message);
      await logSchedulerEvent('error', { message: err.message });
      // Back off 5 min on error
      await new Promise(r => setTimeout(r, 5 * 60 * 1000));
    }
  }
}

// ---- Status helpers for admin API ----

export async function getSchedulerStatus(): Promise<{
  todaySchedule: ScheduledPost[];
  postsToday: number;
  repliesToday: number;
  nextPostAt: Date | null;
}> {
  const db = await getDb();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [postsToday, repliesToday, stateDoc] = await Promise.all([
    db.collection('posts').countDocuments({ postedAt: { $gte: today }, status: 'live' }),
    db.collection('replies').countDocuments({ sentAt: { $gte: today }, status: 'sent' }),
    db.collection('scheduler_state').findOne({ key: 'daily_schedule' }),
  ]);

  const todaySchedule: ScheduledPost[] = stateDoc?.schedule ?? [];
  const nextPost = todaySchedule
    .filter(s => !s.fired)
    .sort((a, b) => new Date(a.fireAt).getTime() - new Date(b.fireAt).getTime())[0];

  return {
    todaySchedule,
    postsToday,
    repliesToday,
    nextPostAt: nextPost ? new Date(nextPost.fireAt) : null,
  };
}
