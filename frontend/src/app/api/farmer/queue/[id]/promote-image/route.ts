import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'https://bagsbro-backend-701423767748.us-central1.run.app';
const headers = () => ({ 'x-admin-secret': process.env.ADMIN_SECRET || '', 'Content-Type': 'application/json' });

export const maxDuration = 60;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const res = await fetch(`${BACKEND}/farmer/queue/${id}/promote-image`, {
    method: 'POST', headers: headers(), body: JSON.stringify(body),
    signal: AbortSignal.timeout(55000),
  });
  const text = await res.text();
  if (!text) return NextResponse.json({ success: false, error: 'Empty response' }, { status: 502 });
  return NextResponse.json(JSON.parse(text), { status: res.status });
}
