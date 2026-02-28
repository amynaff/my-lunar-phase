import { Hono } from "hono";
import { prisma } from "../prisma";

const moodRouter = new Hono();

// Get mood entries for a date range
moodRouter.get("/entries", async (c) => {
  const user = c.get("user" as never) as { id: string } | null;
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const startDate = c.req.query("startDate");
  const endDate = c.req.query("endDate");

  const whereClause: {
    userId: string;
    date?: { gte?: Date; lte?: Date };
  } = {
    userId: user.id,
  };

  if (startDate || endDate) {
    whereClause.date = {};
    if (startDate) whereClause.date.gte = new Date(startDate);
    if (endDate) whereClause.date.lte = new Date(endDate);
  }

  const entries = await prisma.moodEntry.findMany({
    where: whereClause,
    orderBy: { date: "desc" },
  });

  return c.json({ entries });
});

// Get single mood entry by date
moodRouter.get("/entry/:date", async (c) => {
  const user = c.get("user" as never) as { id: string } | null;
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const dateStr = c.req.param("date");
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);

  const entry = await prisma.moodEntry.findUnique({
    where: {
      userId_date: {
        userId: user.id,
        date,
      },
    },
  });

  return c.json({ entry });
});

// Create or update mood entry
moodRouter.post("/entry", async (c) => {
  const user = c.get("user" as never) as { id: string } | null;
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json<{
    date: string;
    mood: number;
    energy: number;
    notes?: string;
    cyclePhase?: string;
    dayOfCycle?: number;
  }>();

  // Validate mood and energy values (1-5)
  if (body.mood < 1 || body.mood > 5 || body.energy < 1 || body.energy > 5) {
    return c.json({ error: "Mood and energy must be between 1 and 5" }, 400);
  }

  const date = new Date(body.date);
  date.setHours(0, 0, 0, 0);

  const entry = await prisma.moodEntry.upsert({
    where: {
      userId_date: {
        userId: user.id,
        date,
      },
    },
    update: {
      mood: body.mood,
      energy: body.energy,
      notes: body.notes ?? null,
      cyclePhase: body.cyclePhase ?? null,
      dayOfCycle: body.dayOfCycle ?? null,
    },
    create: {
      userId: user.id,
      date,
      mood: body.mood,
      energy: body.energy,
      notes: body.notes ?? null,
      cyclePhase: body.cyclePhase ?? null,
      dayOfCycle: body.dayOfCycle ?? null,
    },
  });

  return c.json({ entry });
});

// Delete mood entry
moodRouter.delete("/entry/:date", async (c) => {
  const user = c.get("user" as never) as { id: string } | null;
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const dateStr = c.req.param("date");
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);

  await prisma.moodEntry.delete({
    where: {
      userId_date: {
        userId: user.id,
        date,
      },
    },
  });

  return c.json({ success: true });
});

// Get mood statistics for insights
moodRouter.get("/stats", async (c) => {
  const user = c.get("user" as never) as { id: string } | null;
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const entries = await prisma.moodEntry.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  // Calculate averages by cycle phase
  const phaseStats: Record<string, { moodSum: number; energySum: number; count: number }> = {};

  for (const entry of entries) {
    if (entry.cyclePhase) {
      const phase = entry.cyclePhase;
      if (!phaseStats[phase]) {
        phaseStats[phase] = { moodSum: 0, energySum: 0, count: 0 };
      }
      const stats = phaseStats[phase];
      stats.moodSum += entry.mood;
      stats.energySum += entry.energy;
      stats.count += 1;
    }
  }

  const phaseAverages = Object.entries(phaseStats).map(([phase, stats]) => ({
    phase,
    avgMood: Math.round((stats.moodSum / stats.count) * 10) / 10,
    avgEnergy: Math.round((stats.energySum / stats.count) * 10) / 10,
    entryCount: stats.count,
  }));

  // Overall stats
  const totalEntries = entries.length;
  const avgMood = totalEntries > 0
    ? Math.round((entries.reduce((sum, e) => sum + e.mood, 0) / totalEntries) * 10) / 10
    : 0;
  const avgEnergy = totalEntries > 0
    ? Math.round((entries.reduce((sum, e) => sum + e.energy, 0) / totalEntries) * 10) / 10
    : 0;

  return c.json({
    totalEntries,
    avgMood,
    avgEnergy,
    phaseAverages,
  });
});

export { moodRouter };
