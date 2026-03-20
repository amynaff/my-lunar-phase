import { createAuthClient } from "better-auth/react";
// Import directly from dist path to bypass Metro's broken .cjs→.mjs resolution for this package
// @ts-ignore - types are declared at @better-auth/expo/client but file resolves to dist/client.js
import { expoClient } from "@better-auth/expo/dist/client.js";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: (process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL)! as string,
  plugins: [
    expoClient({
      scheme: "vibecode",
      storagePrefix: "vibecode",
      storage: SecureStore,
    }),
  ],
});

// Export getCookie for use in api.ts
export const getAuthCookie = () => authClient.getCookie();

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
