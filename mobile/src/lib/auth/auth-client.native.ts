import { supabase } from "./supabase";

const mapSession = async () => {
  const result = await supabase.auth.getSession();
  const session = result.data.session;
  const user = session?.user
    ? {
        ...session.user,
        name:
          typeof session.user.user_metadata?.name === "string"
            ? session.user.user_metadata.name
            : typeof session.user.user_metadata?.full_name === "string"
              ? session.user.user_metadata.full_name
              : null,
      }
    : null;
  return {
    data: session && user ? { session, user } : null,
    error: result.error,
  };
};

export const authClient = {
  getSession: mapSession,
  signIn: {
    email: ({ email, password }: { email: string; password: string }) =>
      supabase.auth.signInWithPassword({ email, password }),
    social: ({
      provider,
      idToken,
    }: {
      provider: "apple" | "google";
      idToken: { token: string; nonce?: string; accessToken?: string };
    }) =>
      supabase.auth.signInWithIdToken({
        provider,
        token: idToken.token,
        nonce: idToken.nonce,
        access_token: idToken.accessToken,
      }),
  },
  signUp: {
    email: ({ name, email, password }: { name: string; email: string; password: string }) =>
      supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      }),
  },
  signOut: () => supabase.auth.signOut(),
  requestPasswordReset: ({ email, redirectTo }: { email: string; redirectTo?: string }) =>
    supabase.auth.resetPasswordForEmail(email, { redirectTo }),
};

export const getAccessToken = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? "";
};

// Social sign-in helpers
export const signInWithApple = async (idToken: string, nonce?: string) => {
  return authClient.signIn.social({ provider: "apple", idToken: { token: idToken, nonce } });
};

export const signInWithGoogle = async (idToken: string, accessToken?: string) => {
  return authClient.signIn.social({ provider: "google", idToken: { token: idToken, accessToken } });
};

export const signOut = async () => {
  return authClient.signOut();
};
