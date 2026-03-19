import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST() {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    // Check if user already has an active partnership
    const existingPartnership = await prisma.partnership.findFirst({
      where: { OR: [{ userId: user!.id }, { partnerId: user!.id }] },
    });
    if (existingPartnership) {
      return NextResponse.json({ error: "You already have a partner connected" }, { status: 400 });
    }

    // Delete old unused invites from this user
    await prisma.partnerInvite.deleteMany({
      where: { creatorId: user!.id, usedAt: null },
    });

    // Create new invite (valid for 48 hours)
    const code = generateInviteCode();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const invite = await prisma.partnerInvite.create({
      data: {
        code,
        creatorId: user!.id,
        expiresAt,
      },
    });

    return NextResponse.json({ code: invite.code, expiresAt: invite.expiresAt });
  } catch (err) {
    console.error("Error creating invite:", err);
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }
}
