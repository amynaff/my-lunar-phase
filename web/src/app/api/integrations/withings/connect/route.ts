import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { getWithingsAuthUrl } from "@/lib/integrations/withings";
import crypto from "crypto";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  // Generate CSRF state token with user ID embedded
  const state = `${user!.id}:${crypto.randomBytes(16).toString("hex")}`;

  const authUrl = getWithingsAuthUrl(state);
  return NextResponse.redirect(authUrl);
}
