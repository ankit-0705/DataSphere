import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/', '/landing', '/favicon.ico'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths without auth
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||      // Let API routes handle auth themselves
    pathname.startsWith('/static') ||
    pathname.includes('.')               // Allow static files, assets
  ) {
    return NextResponse.next();
  }

  // Check if token cookie exists
  const token = req.cookies.get('__session')?.value;

  // If no token, redirect to /landing
  if (!token) {
    return NextResponse.redirect(new URL('/landing', req.url));
  }

  // Token exists, allow request to continue
  // Actual token verification happens inside API routes or server-side code
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|landing|$).*)',
  ],
};
