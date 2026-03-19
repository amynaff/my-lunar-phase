import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const partnership = await prisma.partnership.findFirst({
      where: {
        OR: [{ userId: user!.id }, { partnerId: user!.id }],
      },
    });

    if (!partnership) {
      return NextResponse.json({ error: "No partner connected" }, { status: 400 });
    }

    // Delete partnership and shared cycle data in a transaction
    await prisma.$transaction([
      prisma.partnership.delete({ where: { id: partnership.id } }),
      prisma.sharedCycleData.deleteMany({ where: { userId: partnership.userId } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error disconnecting partner:", err);
    return NextResponse.json({ error: "Failed to disconnect partner" }, { status: 500 });
  }
}
