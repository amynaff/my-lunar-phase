import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { encryptIfAvailable, decryptIfEncrypted } from "@/lib/encryption";

/**
 * GET /api/cycle-data — Load cycle data from database
 */
export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const data = await prisma.cycleData.findUnique({
    where: { userId: user!.id },
  });

  if (!data) {
    return NextResponse.json({ cycleData: null });
  }

  // Decrypt sensitive fields
  return NextResponse.json({
    cycleData: {
      lifeStage: data.lifeStage,
      cycleLength: data.cycleLength,
      periodLength: data.periodLength,
      lastPeriodStart: data.lastPeriodStart
        ? decryptIfEncrypted(data.lastPeriodStart)
        : null,
      periodLogs: data.periodLogs
        ? JSON.parse(decryptIfEncrypted(data.periodLogs))
        : [],
      hasCompletedOnboarding: data.hasCompletedOnboarding,
    },
  });
}

/**
 * POST /api/cycle-data — Save cycle data to database (encrypted)
 */
export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const {
    lifeStage,
    cycleLength,
    periodLength,
    lastPeriodStart,
    periodLogs,
    hasCompletedOnboarding,
  } = body;

  // Encrypt sensitive fields
  const encryptedLastPeriod = lastPeriodStart
    ? encryptIfAvailable(lastPeriodStart)
    : null;
  const encryptedPeriodLogs = periodLogs
    ? encryptIfAvailable(JSON.stringify(periodLogs))
    : null;

  const data = await prisma.cycleData.upsert({
    where: { userId: user!.id },
    create: {
      userId: user!.id,
      lifeStage: lifeStage || "regular",
      cycleLength: cycleLength || 28,
      periodLength: periodLength || 5,
      lastPeriodStart: encryptedLastPeriod,
      periodLogs: encryptedPeriodLogs,
      hasCompletedOnboarding: hasCompletedOnboarding || false,
    },
    update: {
      lifeStage: lifeStage || "regular",
      cycleLength: cycleLength || 28,
      periodLength: periodLength || 5,
      lastPeriodStart: encryptedLastPeriod,
      periodLogs: encryptedPeriodLogs,
      hasCompletedOnboarding: hasCompletedOnboarding ?? undefined,
    },
  });

  return NextResponse.json({ success: true, id: data.id });
}
