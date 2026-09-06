import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { isEmailAllowed } from "./allowlist";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    // Bloqueia no login qualquer conta fora da allowlist.
    async signIn({ user }) {
      return isEmailAllowed(user.email);
    },
    async session({ session }) {
      return session;
    },
  },
};
