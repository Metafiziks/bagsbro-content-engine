// ============================================
// Bags Bro! Farmer Bootstrap
// Call initFarmer(app) from your main server.ts
// to register all farmer routes and start scheduler.
// ============================================

import { FastifyInstance } from 'fastify';
import { registerFarmerRoutes } from './routes';
import { startScheduler } from './scheduler';
import { getDb } from '../../db/mongodb';

let schedulerStarted = false;

export async function initFarmer(app: FastifyInstance): Promise<void> {
  // Verify MongoDB is reachable
  try {
    await getDb();
    console.log('[Farmer] MongoDB connection established');
  } catch (err: any) {
    console.error('[Farmer] MongoDB connection failed:', err.message);
    console.error('[Farmer] Farmer will not start — check MONGODB_URI');
    return;
  }

  // Register admin API routes
  await registerFarmerRoutes(app);
  console.log('[Farmer] API routes registered at /farmer/*');

  // Start the scheduler loop in background
  if (!schedulerStarted) {
    schedulerStarted = true;

    // Seed default targets if none exist
    await seedDefaultTargets();

    // Run in background — don't await, it loops forever
    startScheduler().catch(err => {
      console.error('[Farmer] Scheduler crashed:', err.message);
      schedulerStarted = false;
    });

    console.log('[Farmer] Scheduler started 🛍️');
  }
}

async function seedDefaultTargets(): Promise<void> {
  const db = await getDb();
  const count = await db.collection('targets').countDocuments();
  if (count > 0) return;

  console.log('[Farmer] Seeding default target accounts...');

  const defaults = [
    { handle: 'cobie',       tier: 'S', autoApprove: false, autoApproveThreshold: 0.85 },
    { handle: 'hsaka',       tier: 'S', autoApprove: false, autoApproveThreshold: 0.85 },
    { handle: 'beaniemaxi',  tier: 'A', autoApprove: true,  autoApproveThreshold: 0.75 },
    { handle: 'farokh',      tier: 'A', autoApprove: true,  autoApproveThreshold: 0.75 },
    { handle: '0xMert_',     tier: 'A', autoApprove: true,  autoApproveThreshold: 0.75 },
    { handle: 'inversebrah', tier: 'B', autoApprove: true,  autoApproveThreshold: 0.70 },
    { handle: 'thedefiedge', tier: 'B', autoApprove: true,  autoApproveThreshold: 0.70 },
    { handle: 'blknoiz06',   tier: 'A', autoApprove: false, autoApproveThreshold: 0.80 },
  ];

  await db.collection('targets').insertMany(
    defaults.map(t => ({
      ...t,
      active: true,
      totalReplies: 0,
      lastReplied: null,
      lastChecked: null,
      createdAt: new Date(),
    }))
  );

  console.log(`[Farmer] Seeded ${defaults.length} default targets`);
}
