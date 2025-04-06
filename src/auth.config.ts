import type { NextAuthConfig } from 'next-auth';

// Extend the session type to include user ID
declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  // Define the User type for the JWT callback
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnProtectedRoute = nextUrl.pathname.startsWith('/dashboard');
      const isOnUploadRoute = nextUrl.pathname.startsWith('/upload-demo');
      
      // If the user is trying to access a protected route, check if they're logged in
      if (isOnProtectedRoute || isOnUploadRoute) {
        if (isLoggedIn) return true;
        return false; // Redirect to login page
      }
      
      return true; // Allow access to public routes
    },
    jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [], // Providers are configured in the route handler
  session: {
    strategy: 'jwt',
  },
  debug: process.env.NODE_ENV === 'development',
};
