import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'https://bagsbro-backend-701423767748.us-central1.run.app';
const headers = () => ({ 'x-admin-secret': process.env.ADMIN_SECRET || '' });

export const maxDuration = 60;

export async function POST() {
  const res = await fetch(`${BACKEND}/farmer/trends/refresh`, {
    method: 'POST', headers: headers(),
    signal: AbortSignal.timeout(55000),
  });
  const text = await res.text();
  if (!text) return NextResponse.json({ success: false, error: 'Empty response' }, { status: 502 });
  return NextResponse.json(JSON.parse(text), { status: res.status });
}
