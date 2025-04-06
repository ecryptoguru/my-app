import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// This middleware protects routes that should only be accessible to authenticated users
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define which paths require authentication
  const isProtectedPath = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/upload-demo');
  
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

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/upload-demo/:path*',
  ],
};
