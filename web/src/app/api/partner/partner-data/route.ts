import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    // Find partnership where this user is either the user or the partner
    const partnership = await prisma.partnership.findFirst({
      where: {
        OR: [{ partnerId: user!.id }, { userId: user!.id }],
      },
    });

    if (!partnership) {
      return NextResponse.json({ error: "No partner connected", hasPartner: false });
    }

    // The other person's ID
    const otherUserId = partnership.userId === user!.id ? partnership.partnerId : partnership.userId;

    // Get the main user's shared cycle data (always from userId, the invite creator)
    const sharedData = await prisma.sharedCycleData.findUnique({
      where: { userId: partnership.userId },
    });

    const partnerUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: { name: true, id: true },
    });

    return NextResponse.json({
      hasPartner: true,
      partnerName: partnerUser?.name ?? "Your partner",
      isMainUser: partnership.userId === user!.id,
      sharedData: sharedData
        ? {
            lifeStage: sharedData.lifeStage,
            currentPhase: sharedData.currentPhase,
            dayOfCycle: sharedData.dayOfCycle,
            cycleLength: sharedData.cycleLength,
            moonPhase: sharedData.moonPhase,
            lastUpdated: sharedData.lastUpdated,
          }
        : null,
    });
  } catch (err) {
    console.error("Error fetching partner data:", err);
    return NextResponse.json({ error: "Failed to fetch partner data" }, { status: 500 });
  }
}
