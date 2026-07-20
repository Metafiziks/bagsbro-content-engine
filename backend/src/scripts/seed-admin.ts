// src/scripts/seed-admin.ts
// Run once: npx tsx src/scripts/seed-admin.ts
import { getDb, closeDb } from '../db/mongodb';

async function seedAdmin() {
  const db = await getDb();

  await db.collection('admins').updateOne(
    { twitterHandle: 'bagsbromusic' },
    {
      $set: {
        twitterHandle: 'bagsbromusic',
        active: true,
        role: 'superadmin',
        addedAt: new Date(),
      }
    },
    { upsert: true }
  );

  console.log('✅ bagsbromusic added as admin');
  await closeDb();
  process.exit(0);
}

seedAdmin().catch(console.error);
