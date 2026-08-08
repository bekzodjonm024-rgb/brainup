import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/auth/validation";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await db.user.findUnique({
          where: { email },
          include: {
            student: { select: { id: true, firstName: true, lastName: true } },
            professor: { select: { id: true, firstName: true, lastName: true } },
          },
        });

        if (!user) return null;

        const passwordMatch = await compare(password, user.passwordHash);
        if (!passwordMatch) return null;

        const profileId = user.student?.id ?? user.professor?.id ?? null;
        const firstName = user.student?.firstName ?? user.professor?.firstName ?? "";
        const lastName = user.student?.lastName ?? user.professor?.lastName ?? "";

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          profileId,
          name: `${firstName} ${lastName}`.trim(),
        };
      },
    }),
  ],
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
});
