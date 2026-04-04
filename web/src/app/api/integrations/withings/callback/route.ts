import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { exchangeWithingsCode, syncWithingsData } from "@/lib/integrations/withings";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(new URL("/settings?error=missing_params", req.url));
  }

  // Verify state contains our user ID
  const [stateUserId] = state.split(":");
  if (stateUserId !== user!.id) {
    return NextResponse.redirect(new URL("/settings?error=invalid_state", req.url));
  }

  try {
    const tokens = await exchangeWithingsCode(code);

    // Upsert the integration
    const integration = await prisma.healthIntegration.upsert({
      where: { userId_provider: { userId: user!.id, provider: "withings" } },
      create: {
        userId: user!.id,
        provider: "withings",
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        providerUserId: tokens.providerUserId,
        scopes: "user.metrics,user.activity",
      },
      update: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        providerUserId: tokens.providerUserId,
      },
    });

    // Do initial sync in background (don't block redirect)
    syncWithingsData(integration.id, user!.id).catch(console.error);

    return NextResponse.redirect(new URL("/settings?connected=withings", req.url));
  } catch (err) {
    console.error("Withings OAuth error:", err);
    return NextResponse.redirect(new URL("/settings?error=withings_auth_failed", req.url));
  }
}
