import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// RevenueCat sends an Authorization header matching REVENUECAT_WEBHOOK_AUTH_TOKEN
function verifyToken(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const token = process.env.REVENUECAT_WEBHOOK_AUTH_TOKEN;
  if (!token) return true; // token not configured — allow (dev only)
  return authHeader === token;
}

type RevenueCatEvent = {
  event: {
    type: string;
    app_user_id: string;
    product_id: string;
    store: string;
    entitlement_ids?: string[];
    expiration_at_ms?: number;
  };
};

export async function POST(req: NextRequest) {
  if (!verifyToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: RevenueCatEvent;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, app_user_id, product_id, store, entitlement_ids, expiration_at_ms } = body.event;

  // app_user_id is the userId we set via Purchases.logIn()
  const user = await prisma.user.findUnique({ where: { id: app_user_id } });
  if (!user) {
    // Unknown user — acknowledge but skip (could be anonymous)
    return NextResponse.json({ received: true });
  }

  const entitlementId = entitlement_ids?.[0] ?? "premium";
  const expiresAt = expiration_at_ms ? new Date(expiration_at_ms) : null;

  switch (type) {
    case "INITIAL_PURCHASE":
    case "RENEWAL":
    case "PRODUCT_CHANGE":
    case "UNCANCELLATION": {
      await prisma.mobileSubscription.upsert({
        where: { userId: user.id },
        update: {
          revenueCatUserId: app_user_id,
          productId: product_id,
          entitlementId,
          store,
          status: "active",
          expiresAt,
        },
        create: {
          userId: user.id,
          revenueCatUserId: app_user_id,
          productId: product_id,
          entitlementId,
          store,
          status: "active",
          expiresAt,
        },
      });
      break;
    }
    case "CANCELLATION":
    case "EXPIRATION": {
      await prisma.mobileSubscription.updateMany({
        where: { userId: user.id },
        data: { status: type === "CANCELLATION" ? "cancelled" : "expired" },
      });
      break;
    }
    default:
      // Ignore other event types (BILLING_ISSUE, etc.)
      break;
  }

  return NextResponse.json({ received: true });
}
