import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Ultra-permissive middleware for development
export function middleware(req: NextRequest) {
  // Public routes during dev (allow these and do not redirect)
  const publicRoutes = ['/', '/auth/login', '/dashboard', '/dashboard/chat', '/client'];
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

