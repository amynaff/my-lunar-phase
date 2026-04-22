import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { env } from "./env";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "sqlite" }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BACKEND_URL,
  emailAndPassword: {
    enabled: true,
  },

  trustedOrigins: [
    "exp://*/*",
    "http://localhost:*",
    "http://127.0.0.1:*",
    "https://mylunarphase.com",
    "https://*.mylunarphase.com",
    "https://*.up.railway.app",
    "https://appleid.apple.com",
    env.BACKEND_URL,
  ],

  // Social sign-in providers (one-tap authentication)
  socialProviders: {
    apple: {
      clientId: process.env.APPLE_CLIENT_ID || "com.mylunarphase.app",
      clientSecret: process.env.APPLE_CLIENT_SECRET || "",
      // For native iOS apps, this is the bundle ID
      appBundleIdentifier: process.env.APPLE_BUNDLE_ID || "com.mylunarphase.app",
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },

  plugins: [
    expo(),
  ],

  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
    disableCSRFCheck: true,
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      partitioned: true,
    },
    trustedProxyHeaders: true,
  },
});
