// src/lib/auth/config.ts - Server-only auth configuration
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/auth/utils";
import { db } from "@/lib/db";
import { users } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";

// We'll create a separate API route for credential validation to avoid Edge Runtime issues
const handler = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // This function runs on the server, not in the Edge Runtime
        // because credential providers are executed on API calls, not during NextAuth initialization
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user by email
        const result = await db.select().from(users).where(eq(users.email, credentials.email.toLowerCase())).limit(1);
        const user = result[0] || null;

        if (!user || !user.password || !user.isActive) return null;

        const passwordsMatch = await verifyPassword(credentials.password, user.password);

        if (passwordsMatch) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub as string,
          role: token.role as string,
        }
      };
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role as string;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
});

export const { GET, POST } = handler;
export default handler;