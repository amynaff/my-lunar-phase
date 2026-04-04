import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { syncWithingsData } from "@/lib/integrations/withings";

export async function POST() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const integration = await prisma.healthIntegration.findUnique({
    where: { userId_provider: { userId: user!.id, provider: "withings" } },
  });

  if (!integration) {
    return NextResponse.json({ error: "Withings not connected" }, { status: 404 });
  }

  try {
    const count = await syncWithingsData(integration.id, user!.id);
    return NextResponse.json({ success: true, synced: count });
  } catch (err) {
    console.error("Withings sync error:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
