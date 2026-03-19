import { createAuthClient } from "better-auth/react";

// Web version of auth client - no expo-specific plugins
export const authClient = createAuthClient({
  baseURL: (process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL)! as string,
});

// Export getCookie for use in api.ts (not available on web, return empty)
export const getAuthCookie = () => "";

// Social sign-in helpers
export const signInWithApple = async (idToken: string, nonce?: string) => {
  return authClient.signIn.social({
    provider: "apple",
    idToken: {
      token: idToken,
      nonce,
    },
  });
};

export const signInWithGoogle = async (idToken: string, accessToken?: string) => {
  return authClient.signIn.social({
    provider: "google",
    idToken: {
      token: idToken,
      accessToken,
    },
  });
};

export const signOut = async () => {
  return authClient.signOut();
};
