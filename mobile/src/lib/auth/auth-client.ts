import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

// Define emailOTPClient inline to avoid importing from better-auth/client/plugins barrel
// which pulls in custom-session and other modules that fail Metro resolution
const emailOTPClient = () => ({
  id: "email-otp",
  $InferServerPlugin: {} as {
    id: "email-otp";
  },
  getActions: ($fetch: unknown) => ({
    emailOtp: {
      sendVerificationOtp: async (data: { email: string; type: string }) => {
        return (
          $fetch as (
            path: string,
            opts: { method: string; body: unknown }
          ) => Promise<{ data: unknown; error: unknown }>
        )("/email-otp/send-verification-otp", {
          method: "POST",
          body: data,
        });
      },
    },
    signIn: {
      emailOtp: async (data: { email: string; otp: string }) => {
        return (
          $fetch as (
            path: string,
            opts: { method: string; body: unknown }
          ) => Promise<{ data: unknown; error: { message?: string } | null }>
        )("/sign-in/email-otp", {
          method: "POST",
          body: data,
        });
      },
    },
  }),
});

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_BACKEND_URL! as string,
  plugins: [
    expoClient({
      scheme: "vibecode",
      storagePrefix: "vibecode",
      storage: SecureStore,
    }),
    emailOTPClient() as ReturnType<typeof emailOTPClient> & Record<string, unknown>,
  ],
});
