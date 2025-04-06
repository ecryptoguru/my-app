import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// This middleware protects routes that should only be accessible to authenticated users
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define which paths require authentication
  const protectedPaths = ['/dashboard', '/upload-demo'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  // If the path is not protected, allow the request to proceed
  if (!isProtectedPath) {
    return NextResponse.next();
  }
  
  // Check if the user is authenticated
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
  
  // If the user is not authenticated and trying to access a protected route,
  // redirect them to the login page
  if (!token && isProtectedPath) {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  // Allow the request to proceed
  return NextResponse.next();
}

// Configure which paths this middleware will run on
export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api/auth (NextAuth API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
