import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      // Allow linking Google accounts to users pre-created by admin (no prior OAuth record)
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    // Only allow users pre-registered in the system
    async signIn({ user }) {
      if (!user.email) return false;
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      });
      if (!dbUser) return "/login?error=NotRegistered";
      return true;
    },

    // Attach role and fullName to the session object
    session({ session, user }) {
      const dbUser = user as typeof user & { role: Role; fullName: string };
      session.user.id = dbUser.id;
      session.user.role = dbUser.role;
      session.user.fullName = dbUser.fullName;
      return session;
    },
  },
});
