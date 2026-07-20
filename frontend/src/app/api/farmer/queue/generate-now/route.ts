import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'https://bagsbro-backend-701423767748.us-central1.run.app';
const headers = () => ({ 'x-admin-secret': process.env.ADMIN_SECRET || '' });

export async function POST() {
  const res = await fetch(`${BACKEND}/farmer/queue/generate-now`, {
    method: 'POST', headers: headers(),
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
