// ============================================
// MongoDB connection singleton
// Used by farmer services (separate from Prisma/Postgres)
// ============================================

import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI env var not set');

  client = new MongoClient(uri);
  await client.connect();
  db = client.db('bagsbro');

  console.log('[MongoDB] Connected to bagsbro database');
  return db;
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}


