import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const partnership = await prisma.partnership.findFirst({
      where: {
        OR: [{ userId: user!.id }, { partnerId: user!.id }],
      },
    });

    if (!partnership) {
      // Check for pending invites
      const pendingInvite = await prisma.partnerInvite.findFirst({
        where: { creatorId: user!.id, usedAt: null, expiresAt: { gt: new Date() } },
      });

      return NextResponse.json({
        hasPartner: false,
        pendingInvite: pendingInvite
          ? { code: pendingInvite.code, expiresAt: pendingInvite.expiresAt }
          : null,
      });
    }

    const otherUserId = partnership.userId === user!.id ? partnership.partnerId : partnership.userId;
    const partnerUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: { name: true },
    });

    return NextResponse.json({
      hasPartner: true,
      isMainUser: partnership.userId === user!.id,
      partnerName: partnerUser?.name ?? "Your partner",
      connectedSince: partnership.createdAt,
    });
  } catch (err) {
    console.error("Error fetching partner status:", err);
    return NextResponse.json({ error: "Failed to fetch partner status" }, { status: 500 });
  }
}
