import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const entries = await prisma.moodEntry.findMany({
    where: { userId: user!.id },
  });

  const totalEntries = entries.length;
  const avgMood = totalEntries > 0
    ? entries.reduce((sum, e) => sum + e.mood, 0) / totalEntries
    : 0;
  const avgEnergy = totalEntries > 0
    ? entries.reduce((sum, e) => sum + e.energy, 0) / totalEntries
    : 0;

  const phaseGroups: Record<string, { moods: number[]; energies: number[] }> = {};
  for (const entry of entries) {
    const phase = entry.cyclePhase || "unknown";
    if (!phaseGroups[phase]) phaseGroups[phase] = { moods: [], energies: [] };
    phaseGroups[phase].moods.push(entry.mood);
    phaseGroups[phase].energies.push(entry.energy);
  }

  const phaseAverages: Record<string, { avgMood: number; avgEnergy: number; count: number }> = {};
  for (const [phase, data] of Object.entries(phaseGroups)) {
    phaseAverages[phase] = {
      avgMood: data.moods.reduce((a, b) => a + b, 0) / data.moods.length,
      avgEnergy: data.energies.reduce((a, b) => a + b, 0) / data.energies.length,
      count: data.moods.length,
    };
  }

  return NextResponse.json({ totalEntries, avgMood, avgEnergy, phaseAverages });
}
