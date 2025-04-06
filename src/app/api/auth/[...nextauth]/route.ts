import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { z } from "zod";

// Mock user database for credentials provider
// In a real application, you would use a database
const users = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    password: "password123", // In a real app, this would be hashed
  },
];

// Define the authentication handler
const handler = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "your-google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "your-google-client-secret",
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Email and password validation schema
        const credentialsSchema = z.object({
          email: z.string().email(),
          password: z.string().min(8),
        });

        // Validate credentials
        const result = credentialsSchema.safeParse(credentials);
        if (!result.success) {
          return null;
        }

        const { email, password } = result.data;

        // In a real application, you would look this up in a database
        const user = users.find(
          (user) => user.email === email && user.password === password
        );

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: null, // Optional: Add user avatar URL here
        };
      },
    }),
  ],
});

// Export the handler as GET and POST
export { handler as GET, handler as POST };
