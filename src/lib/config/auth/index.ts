import NextAuth from "next-auth";
import { db } from "../drizzle";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import authConfig from "./auth.config";
import type { Adapter } from "next-auth/adapters";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db) as Adapter,
  session: {
    strategy: "jwt",
  },
  ...authConfig,
});
