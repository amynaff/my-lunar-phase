import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";

// Apple Sign In uses a cross-origin POST for its callback (form_post response mode).
// Browsers block cookies with sameSite: "lax" on cross-origin POST requests, so the
// state, pkceCodeVerifier, and callbackUrl cookies are silently dropped — causing the
// auth flow to complete on Apple's side but produce no session on ours.
// Fix: set sameSite: "none" + secure: true on all three OAuth flow cookies.
const isProd = process.env.NODE_ENV === "production";
const cookiePrefix = isProd ? "__Secure-" : "";
const secureCookieOptions = {
  httpOnly: true,
  sameSite: "none" as const,
  path: "/",
  secure: true,
};

const config: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  cookies: {
    callbackUrl: {
      name: `${cookiePrefix}authjs.callback-url`,
      options: secureCookieOptions,
    },
    state: {
      name: `${cookiePrefix}authjs.state`,
      options: secureCookieOptions,
    },
    pkceCodeVerifier: {
      name: `${cookiePrefix}authjs.pkce.code_verifier`,
      options: secureCookieOptions,
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Apple({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;
        if (!user.emailVerified) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const [sub, mobileSub] = await Promise.all([
          prisma.subscription.findUnique({ where: { userId: user.id } }),
          prisma.mobileSubscription.findUnique({ where: { userId: user.id } }),
        ]);
        const hasWebSub = sub?.status === "active";
        const hasMobileSub = mobileSub?.status === "active";
        if (hasWebSub) {
          token.subscriptionPlan = sub!.plan;
        } else if (hasMobileSub) {
          token.subscriptionPlan = "monthly"; // IAP premium
        } else {
          token.subscriptionPlan = "free";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session as any).user.subscriptionPlan = token.subscriptionPlan as string;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
