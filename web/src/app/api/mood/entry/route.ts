import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { moodEntrySchema } from "@/lib/validations/mood";
import { encryptIfAvailable, decryptIfEncrypted } from "@/lib/encryption";

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const parsed = moodEntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { date, mood, energy, notes, cyclePhase, dayOfCycle } = parsed.data;
  const dateObj = new Date(date);
  dateObj.setUTCHours(0, 0, 0, 0);

  // Encrypt sensitive notes before storing
  const encryptedNotes = notes ? encryptIfAvailable(notes) : null;

  const entry = await prisma.moodEntry.upsert({
    where: { userId_date: { userId: user!.id, date: dateObj } },
    update: { mood, energy, notes: encryptedNotes, cyclePhase, dayOfCycle },
    create: { userId: user!.id, date: dateObj, mood, energy, notes: encryptedNotes, cyclePhase, dayOfCycle },
  });

  // Decrypt before returning to client
  return NextResponse.json({
    entry: {
      ...entry,
      notes: entry.notes ? decryptIfEncrypted(entry.notes) : null,
    },
  });
}
