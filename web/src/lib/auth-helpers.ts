import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "./prisma";
import { createSupabaseServerClient, createSupabaseTokenClient } from "./supabase/server";

type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
};

async function ensureAppUser(user: AuthUser) {
  await prisma.user.upsert({
    where: { id: user.id },
    update: {
      email: user.email,
      name: user.name,
    },
    create: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
}

export async function requireAuth() {
  const headerStore = await headers();
  const authHeader = headerStore.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;

  const supabase = bearerToken
    ? createSupabaseTokenClient(bearerToken)
    : await createSupabaseServerClient();

  const { data, error: authError } = await supabase.auth.getUser();
  const authUser = data.user;

  if (authError || !authUser?.id || !authUser.email) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const user = {
    id: authUser.id,
    email: authUser.email,
    name:
      typeof authUser.user_metadata?.name === "string"
        ? authUser.user_metadata.name
        : typeof authUser.user_metadata?.full_name === "string"
          ? authUser.user_metadata.full_name
          : null,
  };

  await ensureAppUser(user);

  return { user, error: null };
}

export function corsHeaders(origin?: string | null) {
  const allowedOrigins = [
    /^https?:\/\/localhost(:\d+)?$/,
    /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
    /\.dev\.vibecode\.run$/,
    /\.vibecode\.run$/,
    /^https:\/\/(www\.)?mylunarphase\.com$/,
  ];

  const isAllowed = origin && allowedOrigins.some((pattern) => pattern.test(origin));

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin! : "",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

export function withCors(response: NextResponse, origin?: string | null) {
  const headers = corsHeaders(origin);
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}
