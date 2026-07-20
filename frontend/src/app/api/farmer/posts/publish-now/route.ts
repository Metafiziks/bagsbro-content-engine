import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'https://bagsbro-backend-701423767748.us-central1.run.app';
const headers = () => ({ 'x-admin-secret': process.env.ADMIN_SECRET || '' });

// Extend Vercel function timeout to 60s — posting + pixel art can take 15-30s
export const maxDuration = 60;

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const url = type
    ? `${BACKEND}/farmer/posts/publish-now?type=${type}`
    : `${BACKEND}/farmer/posts/publish-now`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: headers(),
      signal: AbortSignal.timeout(55000), // 55s — just under the 60s function limit
    });

    const text = await res.text();
    if (!text) {
      return NextResponse.json({ success: false, error: 'Empty response from backend' }, { status: 502 });
    }

    const data = JSON.parse(text);
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    if (err.name === 'TimeoutError') {
      // Backend is still running — don't treat as failure, just unknown
      return NextResponse.json({ success: null, error: 'timeout — check X to confirm if post went through' }, { status: 202 });
    }
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
