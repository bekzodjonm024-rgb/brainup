import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/auth/validation";
import { authConfig } from "./config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
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

        if (!user || !user.isActive) return null;

        const passwordMatch = await compare(password, user.passwordHash);
        if (!passwordMatch) return null;

        const profileId = user.student?.id ?? user.professor?.id ?? null;
        const firstName = user.student?.firstName ?? user.professor?.firstName ?? "";
        const lastName = user.student?.lastName ?? user.professor?.lastName ?? "";
        const derivedName = `${firstName} ${lastName}`.trim();

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          profileId,
          name: user.displayName ?? derivedName,
        };
      },
    }),
  ],
});
