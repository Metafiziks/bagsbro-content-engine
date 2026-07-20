import { NextRequest, NextResponse } from 'next/server';
const BACKEND = process.env.BACKEND_URL || 'https://bagsbro-backend-701423767748.us-central1.run.app';
const headers = () => ({ 'x-admin-secret': process.env.ADMIN_SECRET || '' });

export async function POST(req: NextRequest) {
  const res = await fetch(`${BACKEND}/farmer/media/upload`, {
    method: 'POST',
    headers: headers(),
    body: await req.formData(),
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
export async function DELETE(req: NextRequest) {
  const res = await fetch(`${BACKEND}/farmer/media/upload`, {
    method: 'DELETE',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify(await req.json()),
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
