import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { PROVIDER_CONFIGS, type Provider } from "@/lib/integrations/types";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const connected = await prisma.healthIntegration.findMany({
    where: { userId: user!.id },
    select: {
      provider: true,
      connectedAt: true,
      lastSyncAt: true,
    },
  });

  const connectedMap = new Map(connected.map((c) => [c.provider, c]));

  const integrations = Object.entries(PROVIDER_CONFIGS).map(([key, config]) => {
    const connection = connectedMap.get(key);
    return {
      provider: key as Provider,
      displayName: config.displayName,
      description: config.description,
      icon: config.icon,
      measurements: config.measurements,
      connected: !!connection,
      connectedAt: connection?.connectedAt || null,
      lastSyncAt: connection?.lastSyncAt || null,
      available: !!config.authUrl, // Garmin has no OAuth URL yet
    };
  });

  return NextResponse.json({ integrations });
}
