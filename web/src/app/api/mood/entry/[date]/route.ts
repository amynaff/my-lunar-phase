import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { decryptIfEncrypted } from "@/lib/encryption";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { date } = await params;
  const dateObj = new Date(date);
  dateObj.setUTCHours(0, 0, 0, 0);

  const entry = await prisma.moodEntry.findUnique({
    where: { userId_date: { userId: user!.id, date: dateObj } },
  });

  if (!entry) return NextResponse.json({ entry: null });

  return NextResponse.json({
    entry: {
      ...entry,
      notes: entry.notes ? decryptIfEncrypted(entry.notes) : null,
    },
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { date } = await params;
  const dateObj = new Date(date);
  dateObj.setUTCHours(0, 0, 0, 0);

  await prisma.moodEntry.deleteMany({
    where: { userId: user!.id, date: dateObj },
  });

  return NextResponse.json({ success: true });
}
