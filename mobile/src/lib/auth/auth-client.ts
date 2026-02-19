import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

const COOKIE_KEY = "vibecode_auth_cookie";

// Store cookie globally for sync access
let cachedCookie = "";

// Initialize cookie from storage
SecureStore.getItemAsync(COOKIE_KEY).then((value) => {
  cachedCookie = value || "";
});

// Helper to get cookie synchronously
export const getAuthCookie = () => cachedCookie;

// Helper to set cookie
export const setAuthCookie = async (cookie: string) => {
  cachedCookie = cookie;
  await SecureStore.setItemAsync(COOKIE_KEY, cookie);
};

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
  baseURL: (process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL)! as string,
  fetchOptions: {
    onSuccess: async (ctx) => {
      const setCookie = ctx.response.headers.get("set-cookie");
      if (setCookie) {
        await setAuthCookie(setCookie);
      }
    },
  },
  plugins: [
    emailOTPClient() as ReturnType<typeof emailOTPClient> & Record<string, unknown>,
  ],
});
