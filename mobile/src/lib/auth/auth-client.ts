import { createAuthClient } from "better-auth/react";

// Generic fallback auth client (no expo-specific plugins)
// iOS/Android uses auth-client.native.ts, Web uses auth-client.web.ts
export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_BACKEND_URL! as string,
});

export const getAuthCookie = () => "";

export const signInWithApple = async (idToken: string, nonce?: string) => {
  return authClient.signIn.social({
    provider: "apple",
    idToken: { token: idToken, nonce },
  });
};

export const signInWithGoogle = async (idToken: string, accessToken?: string) => {
  return authClient.signIn.social({
    provider: "google",
    idToken: { token: idToken, accessToken },
  });
};

export const signOut = async () => {
  return authClient.signOut();
};
