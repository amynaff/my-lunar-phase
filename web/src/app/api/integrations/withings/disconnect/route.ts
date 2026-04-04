import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const { user, error } = await requireAuth();
  if (error) return error;

  // Delete integration and all associated measurements (cascade)
  await prisma.healthIntegration.deleteMany({
    where: { userId: user!.id, provider: "withings" },
  });

  return NextResponse.json({ success: true });
}
