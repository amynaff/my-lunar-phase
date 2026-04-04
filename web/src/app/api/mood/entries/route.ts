import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { decryptIfEncrypted } from "@/lib/encryption";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const searchParams = req.nextUrl.searchParams;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const where: any = { userId: user!.id };
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  const entries = await prisma.moodEntry.findMany({
    where,
    orderBy: { date: "desc" },
  });

  // Decrypt notes before returning
  const decryptedEntries = entries.map((e) => ({
    ...e,
    notes: e.notes ? decryptIfEncrypted(e.notes) : null,
  }));

  return NextResponse.json({ entries: decryptedEntries });
}
