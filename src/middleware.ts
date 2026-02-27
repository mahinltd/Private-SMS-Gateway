import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define public and protected paths
  const isPublicPath = path === '/login';
  const isProtectedPath = path.startsWith('/dashboard');

  // Get the token from cookies
  const token = request.cookies.get('admin_token')?.value || '';

  // If user is logged in and tries to access the login page, redirect to dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
  }

  // If user is not logged in and tries to access a protected path, redirect to login
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  // Otherwise, let them proceed
  return NextResponse.next();
}

// Specify the paths where this middleware should run
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login'
  ]
};