import { authOptions } from '@/auth';
import NextAuth from 'next-auth';

// Export the NextAuth handler functions for API routes
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
