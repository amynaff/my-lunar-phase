import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncWithingsData } from "@/lib/integrations/withings";

// Withings sends notifications when new data is available
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const userid = formData.get("userid")?.toString();

    if (!userid) {
      return NextResponse.json({ error: "Missing userid" }, { status: 400 });
    }

    // Find integration by Withings user ID
    const integration = await prisma.healthIntegration.findFirst({
      where: { provider: "withings", providerUserId: userid },
    });

    if (!integration) {
      return NextResponse.json({ error: "Unknown user" }, { status: 404 });
    }

    // Sync in background
    syncWithingsData(integration.id, integration.userId).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Withings webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

// Withings sends a HEAD request to verify the callback URL
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}

// Withings may also verify via GET
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
