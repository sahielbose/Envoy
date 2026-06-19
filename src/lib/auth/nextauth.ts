import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { env } from "@/lib/env";

const providers: NextAuthConfig["providers"] = [];
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({ clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET }),
  );
}

/**
 * Real Auth.js (Google OAuth). Magic-link email is added alongside the Prisma
 * adapter when DATABASE_URL is connected (verification tokens need a store).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  secret: env.NEXTAUTH_SECRET,
  trustHost: true,
});
