import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { acceptInviteSchema } from "@/lib/validations/partner";

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const parsed = acceptInviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const code = parsed.data.code.trim().toUpperCase();

  try {
    // Find the invite
    const invite = await prisma.partnerInvite.findUnique({
      where: { code },
      include: { creator: true },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
    }

    if (invite.usedAt) {
      return NextResponse.json({ error: "This invite has already been used" }, { status: 400 });
    }

    if (new Date() > invite.expiresAt) {
      return NextResponse.json({ error: "This invite has expired" }, { status: 400 });
    }

    if (invite.creatorId === user!.id) {
      return NextResponse.json({ error: "You can't accept your own invite" }, { status: 400 });
    }

    // Check if either user already has a partnership
    const existingPartnership = await prisma.partnership.findFirst({
      where: {
        OR: [
          { userId: user!.id },
          { partnerId: user!.id },
          { userId: invite.creatorId },
          { partnerId: invite.creatorId },
        ],
      },
    });
    if (existingPartnership) {
      return NextResponse.json({ error: "One of you already has a partner connected" }, { status: 400 });
    }

    // Create partnership and mark invite as used in a transaction
    await prisma.$transaction([
      prisma.partnership.create({
        data: {
          userId: invite.creatorId,
          partnerId: user!.id,
        },
      }),
      prisma.partnerInvite.update({
        where: { id: invite.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({
      success: true,
      partnerName: invite.creator.name,
    });
  } catch (err) {
    console.error("Error accepting invite:", err);
    return NextResponse.json({ error: "Failed to accept invite" }, { status: 500 });
  }
}
