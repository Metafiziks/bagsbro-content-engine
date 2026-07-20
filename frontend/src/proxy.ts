import { NextRequest, NextResponse } from 'next/server';

// Auth is handled client-side via localStorage JWT.
// No server-side cookie check needed.
export function proxy(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
