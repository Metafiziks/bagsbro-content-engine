import { NextRequest, NextResponse } from 'next/server';
const BACKEND = process.env.BACKEND_URL || 'https://bagsbro-backend-701423767748.us-central1.run.app';
const headers = () => ({ 'x-admin-secret': process.env.ADMIN_SECRET || '' });

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const res = await fetch(`${BACKEND}/farmer/replies/pending?${searchParams}`, { headers: headers() });
  return NextResponse.json(await res.json(), { status: res.status });
}
