import * as SecureStore from "expo-secure-store";

const COOKIE_KEY = "vibecode_auth_cookie";
const baseURL = (process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL)!;

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

// Helper to clear cookie on sign out
export const clearAuthCookie = async () => {
  cachedCookie = "";
  await SecureStore.deleteItemAsync(COOKIE_KEY);
};

// Custom fetch wrapper for auth requests
const authFetch = async (path: string, options: RequestInit = {}) => {
  const response = await fetch(`${baseURL}/api/auth${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Cookie: cachedCookie,
      ...options.headers,
    },
    credentials: "include",
  });

  // Save any set-cookie header
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    await setAuthCookie(setCookie);
  }

  return response;
};

// Auth client with manual implementations
export const authClient = {
  emailOtp: {
    sendVerificationOtp: async (data: { email: string; type: string }) => {
      const response = await authFetch("/email-otp/send-verification-otp", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const json = await response.json();
      return { data: json, error: response.ok ? null : json };
    },
  },
  signIn: {
    emailOtp: async (data: { email: string; otp: string }) => {
      const response = await authFetch("/sign-in/email-otp", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const json = await response.json();
      return { data: json, error: response.ok ? null : { message: json.message || "Invalid code" } };
    },
  },
  signOut: async () => {
    await authFetch("/sign-out", { method: "POST" });
    await clearAuthCookie();
    return { data: null, error: null };
  },
  getSession: async () => {
    try {
      const response = await authFetch("/get-session", { method: "GET" });
      if (!response.ok) {
        return { data: null, error: { message: "Not authenticated" } };
      }
      const json = await response.json();
      return { data: json, error: null };
    } catch {
      return { data: null, error: { message: "Network error" } };
    }
  },
};
