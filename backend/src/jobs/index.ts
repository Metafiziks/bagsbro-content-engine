import { Queue } from 'bullmq';
import { createBullConnection } from '../db/redis';

// ---- Queues ----

const connection = createBullConnection();

export const tweetQueue = new Queue('tweet-publishing', { connection });

export function startWorkers(): void {
  console.log('✅ BullMQ workers started');
}
