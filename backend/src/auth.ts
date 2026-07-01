import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { env } from "./env";
import { getResendClient } from "./lib/resend";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BACKEND_URL,
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const resend = getResendClient();
      const from = env.EMAIL_FROM || "MyLunarPhase <hello@mylunarphase.com>";
      const { error } = await resend.emails.send({
        from,
        to: user.email,
        subject: "Reset your My Lunar Phase password",
        html: `
          <p>We received a request to reset your My Lunar Phase password.</p>
          <p><a href="${url}">Tap here to reset your password</a></p>
          <p>If you didn't request this, you can safely ignore this email. This link expires in 1 hour.</p>
        `,
      });
      if (error) {
        console.error("Failed to send reset password email:", error);
        throw new Error("Failed to send reset password email");
      }
    },
  },

  trustedOrigins: [
    "exp://*/*",
    "http://localhost:*",
    "http://127.0.0.1:*",
    "https://mylunarphase.com",
    "https://*.mylunarphase.com",
    "https://*.up.railway.app",
    "https://appleid.apple.com",
    // Mobile app's custom URL scheme — required so the emailed reset-password
    // link (which redirects to this deep link as its callbackURL) passes
    // Better Auth's origin check on the /reset-password/:token callback route.
    "my-lunar-phase://",
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
