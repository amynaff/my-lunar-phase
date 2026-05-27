import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    // Cascading delete in proper order to respect foreign key constraints
    // Delete sessions
    await prisma.session.deleteMany({
      where: { userId: user!.id },
    });

    // Delete accounts (OAuth/social connections)
    await prisma.account.deleteMany({
      where: { userId: user!.id },
    });

    // Delete partner invites
    await prisma.partnerInvite.deleteMany({
      where: { creatorId: user!.id },
    });

    // Delete partnerships (where user is either side)
    await prisma.partnership.deleteMany({
      where: {
        OR: [{ userId: user!.id }, { partnerId: user!.id }],
      },
    });

    // Delete shared cycle data
    await prisma.sharedCycleData.deleteMany({
      where: { userId: user!.id },
    });

    // Delete mood entries
    await prisma.moodEntry.deleteMany({
      where: { userId: user!.id },
    });

    // Delete AI conversations (messages cascade via onDelete)
    await prisma.aIConversation.deleteMany({
      where: { userId: user!.id },
    });

    // Delete subscription
    await prisma.subscription.deleteMany({
      where: { userId: user!.id },
    });

    // Finally, delete the user
    await prisma.user.delete({
      where: { id: user!.id },
    });

    return NextResponse.json({ success: true, message: "Account deleted" });
  } catch (err) {
    console.error("Error deleting account:", err);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
