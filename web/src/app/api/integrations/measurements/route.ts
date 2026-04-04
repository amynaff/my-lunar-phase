import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const type = req.nextUrl.searchParams.get("type");
  const days = parseInt(req.nextUrl.searchParams.get("days") || "30");
  const provider = req.nextUrl.searchParams.get("provider");

  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const where: Record<string, unknown> = {
    userId: user!.id,
    measuredAt: { gte: startDate },
  };
  if (type) where.type = type;
  if (provider) where.provider = provider;

  const measurements = await prisma.healthMeasurement.findMany({
    where,
    orderBy: { measuredAt: "desc" },
    take: 500,
    select: {
      id: true,
      type: true,
      value: true,
      unit: true,
      secondaryValue: true,
      measuredAt: true,
      provider: true,
    },
  });

  return NextResponse.json({ measurements });
}
