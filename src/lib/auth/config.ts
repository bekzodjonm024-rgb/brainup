import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
        token.profileId = (user as { profileId: string | null }).profileId;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.role = token.role as string;
        session.user.profileId = token.profileId as string | null;
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
