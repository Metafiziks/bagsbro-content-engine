import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'https://bagsbro-backend-701423767748.us-central1.run.app';
const adminHeader = () => ({ 'x-admin-secret': process.env.ADMIN_SECRET || '' });
const jsonHeaders = () => ({ ...adminHeader(), 'Content-Type': 'application/json' });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const res = await fetch(`${BACKEND}/farmer/media/${id}`, {
    method: 'PATCH',
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  });
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${BACKEND}/farmer/media/${id}`, {
    method: 'DELETE',
    headers: adminHeader(), // no Content-Type on DELETE — no body
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
