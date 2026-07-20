import Redis from 'ioredis';
import { env } from '../config/env';

// Main Redis client for caching and pub/sub
export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // required for BullMQ
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err.message);
});

// Separate connection for BullMQ (it needs its own)
export const createBullConnection = () =>
  new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

// Helper: Cache with TTL
export async function cacheGet<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data) as T;
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}

export async function cacheDel(key: string): Promise<void> {
  await redis.del(key);
}

// Helper: Pub/Sub for live game events
export const pubClient = redis.duplicate();
export const subClient = redis.duplicate();

export function publishGameEvent(gameId: string, event: unknown): void {
  pubClient.publish(`game:${gameId}`, JSON.stringify(event));
}
