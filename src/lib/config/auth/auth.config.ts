import type { NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Google from "next-auth/providers/google";

export default {
  providers: [Google],
  callbacks: {
    jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },
  pages: {
    signIn: "/auth?method=signin",
  },
} satisfies NextAuthConfig;
