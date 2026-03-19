import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { syncCycleSchema } from "@/lib/validations/partner";

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const parsed = syncCycleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    await prisma.sharedCycleData.upsert({
      where: { userId: user!.id },
      update: {
        lifeStage: parsed.data.lifeStage,
        currentPhase: parsed.data.currentPhase,
        dayOfCycle: parsed.data.dayOfCycle ?? null,
        cycleLength: parsed.data.cycleLength ?? null,
        moonPhase: parsed.data.moonPhase ?? null,
        lastUpdated: new Date(),
      },
      create: {
        userId: user!.id,
        lifeStage: parsed.data.lifeStage,
        currentPhase: parsed.data.currentPhase,
        dayOfCycle: parsed.data.dayOfCycle ?? null,
        cycleLength: parsed.data.cycleLength ?? null,
        moonPhase: parsed.data.moonPhase ?? null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error syncing cycle data:", err);
    return NextResponse.json({ error: "Failed to sync cycle data" }, { status: 500 });
  }
}
