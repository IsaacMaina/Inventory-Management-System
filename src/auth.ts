import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { validateLoginCredentials } from "@/lib/validation";
import { mapDatabaseRoleToEnum } from "@/lib/auth/utils";

// For now, we'll set up a basic configuration that should work in the Edge Runtime
// The actual credential verification will happen in an API route
export const authOptions = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Validate credentials using our validation utilities
          validateLoginCredentials({
            email: credentials?.email || "",
            password: credentials?.password || ""
          });

          // Call external API to verify credentials (this will be handled server-side)
          const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials!.email,
              password: credentials!.password
            }),
          });

          if (response.ok) {
            // Safely parse the JSON response
            let user;
            try {
              user = await response.json();
            } catch (jsonError) {
              console.error("Error parsing user data from response:", jsonError);
              throw new Error('Authentication service returned invalid response format');
            }
            // Return user object if authenticated
            return user;
          } else {
            // Safely parse the error response
            let errorData;
            try {
              errorData = await response.json();
            } catch (jsonError) {
              console.error("Error parsing error response from auth callback:", jsonError);
              throw new Error('Authentication service returned invalid error format');
            }

            // Throw specific error for invalid credentials
            throw new Error(errorData.error || 'Invalid email or password');
          }
        } catch (error) {
          console.error("Error during authorization:", error);
          // Re-throw the error instead of returning null to show the proper message
          if (error instanceof Error) {
            throw error;
          } else {
            throw new Error('Invalid email or password');
          }
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role;
      }

      return session;
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.sub = user.id;
        // Convert database role string to enum value for proper authorization
        const mappedRole = mapDatabaseRoleToEnum(user.role as string);
        token.role = mappedRole;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  // Security settings
  session: {
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60, // 24 hours
  },
  // Add security headers to JWT
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  // Enable csrf protection
  csrfToken: true,
};

const handler = NextAuth(authOptions);

// Export the handlers
export { handler as GET, handler as POST };
export default handler;

// Export the auth function for server components
export const auth = handler.auth;
export const signIn = handler.signIn;
export const signOut = handler.signOut;