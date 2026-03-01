import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../prisma";

interface GrokResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}

const journalRouter = new Hono<{
  Variables: {
    user: { id: string; name: string; email: string } | null;
    session: { id: string } | null;
  };
}>();

// Middleware to require authentication
const requireAuth = async (c: any, next: any) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
};

journalRouter.use("*", requireAuth);

// ==================== Journal Entry CRUD ====================

// Get all journal entries for a user (with optional filters)
journalRouter.get(
  "/entries",
  zValidator(
    "query",
    z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      cyclePhase: z.string().optional(),
      limit: z.string().optional(),
    })
  ),
  async (c) => {
    const user = c.get("user")!;
    const { startDate, endDate, cyclePhase, limit } = c.req.valid("query");

    const where: any = { userId: user.id };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (cyclePhase) {
      where.cyclePhase = cyclePhase;
    }

    const entries = await prisma.journalEntry.findMany({
      where,
      orderBy: { date: "desc" },
      take: limit ? parseInt(limit) : undefined,
    });

    return c.json({
      entries: entries.map((e) => ({
        ...e,
        tags: JSON.parse(e.tags || "[]"),
      })),
    });
  }
);

// Get a single journal entry
journalRouter.get("/entries/:id", async (c) => {
  const user = c.get("user")!;
  const id = c.req.param("id");

  const entry = await prisma.journalEntry.findFirst({
    where: { id, userId: user.id },
  });

  if (!entry) {
    return c.json({ error: "Entry not found" }, 404);
  }

  return c.json({
    entry: {
      ...entry,
      tags: JSON.parse(entry.tags || "[]"),
    },
  });
});

// Create a new journal entry
journalRouter.post(
  "/entries",
  zValidator(
    "json",
    z.object({
      date: z.string(),
      title: z.string().optional(),
      content: z.string(),
      voiceMemoUri: z.string().optional(),
      voiceMemoDuration: z.number().optional(),
      prompt: z.string().optional(),
      cyclePhase: z.string().optional(),
      dayOfCycle: z.number().optional(),
      mood: z.number().min(1).max(5).optional(),
      tags: z.array(z.string()).default([]),
    })
  ),
  async (c) => {
    const user = c.get("user")!;
    const data = c.req.valid("json");

    const entry = await prisma.journalEntry.create({
      data: {
        userId: user.id,
        date: new Date(data.date),
        title: data.title,
        content: data.content,
        voiceMemoUri: data.voiceMemoUri,
        voiceMemoDuration: data.voiceMemoDuration,
        prompt: data.prompt,
        cyclePhase: data.cyclePhase,
        dayOfCycle: data.dayOfCycle,
        mood: data.mood,
        tags: JSON.stringify(data.tags),
      },
    });

    // Trigger async pattern detection after new entry
    triggerPatternDetection(user.id).catch(console.error);

    return c.json({
      entry: {
        ...entry,
        tags: data.tags,
      },
    });
  }
);

// Update a journal entry
journalRouter.put(
  "/entries/:id",
  zValidator(
    "json",
    z.object({
      title: z.string().optional(),
      content: z.string().optional(),
      voiceMemoUri: z.string().optional(),
      voiceMemoDuration: z.number().optional(),
      prompt: z.string().optional(),
      cyclePhase: z.string().optional(),
      dayOfCycle: z.number().optional(),
      mood: z.number().min(1).max(5).optional(),
      tags: z.array(z.string()).optional(),
    })
  ),
  async (c) => {
    const user = c.get("user")!;
    const id = c.req.param("id");
    const data = c.req.valid("json");

    const existing = await prisma.journalEntry.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return c.json({ error: "Entry not found" }, 404);
    }

    const updateData: any = { ...data };
    if (data.tags) {
      updateData.tags = JSON.stringify(data.tags);
    }

    const entry = await prisma.journalEntry.update({
      where: { id },
      data: updateData,
    });

    return c.json({
      entry: {
        ...entry,
        tags: JSON.parse(entry.tags || "[]"),
      },
    });
  }
);

// Delete a journal entry
journalRouter.delete("/entries/:id", async (c) => {
  const user = c.get("user")!;
  const id = c.req.param("id");

  const existing = await prisma.journalEntry.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return c.json({ error: "Entry not found" }, 404);
  }

  await prisma.journalEntry.delete({ where: { id } });

  return c.json({ success: true });
});

// ==================== Quick Check-In ====================

journalRouter.post(
  "/quick-check-in",
  zValidator(
    "json",
    z.object({
      mood: z.number().min(1).max(5),
      note: z.string().max(280), // Brief note like a tweet
      tags: z.array(z.string()).default([]),
      cyclePhase: z.string().optional(),
      dayOfCycle: z.number().optional(),
    })
  ),
  async (c) => {
    const user = c.get("user")!;
    const data = c.req.valid("json");

    // Create a quick check-in as a journal entry with special formatting
    const entry = await prisma.journalEntry.create({
      data: {
        userId: user.id,
        date: new Date(),
        title: "Quick Check-In",
        content: data.note,
        cyclePhase: data.cyclePhase,
        dayOfCycle: data.dayOfCycle,
        mood: data.mood,
        tags: JSON.stringify([...data.tags, "quick-check-in"]),
      },
    });

    // Trigger async pattern detection
    triggerPatternDetection(user.id).catch(console.error);

    return c.json({
      entry: {
        ...entry,
        tags: [...data.tags, "quick-check-in"],
      },
    });
  }
);

// ==================== AI Pattern Detection & Insights ====================

// Get user's journal insights
journalRouter.get("/insights", async (c) => {
  const user = c.get("user")!;

  const insights = await prisma.journalInsight.findMany({
    where: {
      userId: user.id,
      isDismissed: false,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return c.json({
    insights: insights.map((i) => ({
      ...i,
      relatedTags: i.relatedTags ? JSON.parse(i.relatedTags) : [],
      relatedPhases: i.relatedPhases ? JSON.parse(i.relatedPhases) : [],
      dateRange: i.dateRange ? JSON.parse(i.dateRange) : null,
    })),
  });
});

// Mark an insight as read
journalRouter.post("/insights/:id/read", async (c) => {
  const user = c.get("user")!;
  const id = c.req.param("id");

  await prisma.journalInsight.updateMany({
    where: { id, userId: user.id },
    data: { isRead: true },
  });

  return c.json({ success: true });
});

// Dismiss an insight
journalRouter.post("/insights/:id/dismiss", async (c) => {
  const user = c.get("user")!;
  const id = c.req.param("id");

  await prisma.journalInsight.updateMany({
    where: { id, userId: user.id },
    data: { isDismissed: true },
  });

  return c.json({ success: true });
});

// Manually trigger pattern analysis
journalRouter.post("/analyze", async (c) => {
  const user = c.get("user")!;

  try {
    await triggerPatternDetection(user.id);
    return c.json({ success: true, message: "Analysis started" });
  } catch (error) {
    console.error("Pattern analysis error:", error);
    return c.json({ error: "Analysis failed" }, 500);
  }
});

// Get journal stats and patterns summary
journalRouter.get("/stats", async (c) => {
  const user = c.get("user")!;

  // Get entries from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const entries = await prisma.journalEntry.findMany({
    where: {
      userId: user.id,
      date: { gte: thirtyDaysAgo },
    },
    orderBy: { date: "desc" },
  });

  // Calculate stats
  const totalEntries = entries.length;

  // Mood average
  const entriesWithMood = entries.filter((e) => e.mood);
  const avgMood =
    entriesWithMood.length > 0
      ? entriesWithMood.reduce((sum, e) => sum + (e.mood || 0), 0) /
        entriesWithMood.length
      : null;

  // Tag frequency
  const tagCounts: Record<string, number> = {};
  entries.forEach((e) => {
    const tags = JSON.parse(e.tags || "[]") as string[];
    tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));

  // Phase distribution
  const phaseCounts: Record<string, number> = {};
  entries.forEach((e) => {
    if (e.cyclePhase) {
      phaseCounts[e.cyclePhase] = (phaseCounts[e.cyclePhase] || 0) + 1;
    }
  });

  // Streak calculation
  const sortedDates = entries
    .map((e) => e.date.toISOString().split("T")[0])
    .filter((d): d is string => d !== undefined)
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort();
  let currentStreak = 0;
  const today = new Date().toISOString().split("T")[0] ?? "";
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0] ?? "";

  if (today && yesterday && (sortedDates.includes(today) || sortedDates.includes(yesterday))) {
    const startDateStr = sortedDates.includes(today) ? today : yesterday;
    let checkDate = new Date(startDateStr);
    let checkDateStr = checkDate.toISOString().split("T")[0] ?? "";
    while (checkDateStr && sortedDates.includes(checkDateStr)) {
      currentStreak++;
      checkDate = new Date(checkDate.getTime() - 86400000);
      checkDateStr = checkDate.toISOString().split("T")[0] ?? "";
    }
  }

  return c.json({
    stats: {
      totalEntries,
      avgMood: avgMood ? Math.round(avgMood * 10) / 10 : null,
      topTags,
      phaseCounts,
      currentStreak,
      entriesLast30Days: totalEntries,
    },
  });
});

// ==================== Pattern Detection Logic ====================

async function triggerPatternDetection(userId: string) {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) {
    console.log("GROK_API_KEY not configured, skipping pattern detection");
    return;
  }

  // Get recent entries (last 14 days for pattern detection)
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const entries = await prisma.journalEntry.findMany({
    where: {
      userId,
      date: { gte: twoWeeksAgo },
    },
    orderBy: { date: "asc" },
  });

  if (entries.length < 3) {
    // Need at least 3 entries for meaningful pattern detection
    return;
  }

  // Format entries for AI analysis
  const entriesForAnalysis = entries.map((e) => ({
    date: e.date.toISOString().split("T")[0],
    content: e.content.substring(0, 500), // Limit content length
    mood: e.mood,
    tags: JSON.parse(e.tags || "[]"),
    cyclePhase: e.cyclePhase,
    dayOfCycle: e.dayOfCycle,
    isQuickCheckIn: (JSON.parse(e.tags || "[]") as string[]).includes(
      "quick-check-in"
    ),
  }));

  const systemPrompt = `You are an empathetic journal analyst for a women's wellness app focused on cycle-syncing. Your job is to detect meaningful patterns in journal entries and provide gentle, supportive insights.

Analyze the following journal entries and identify 1-3 meaningful patterns or observations. Focus on:
1. Emotional patterns (recurring feelings, mood trends)
2. Cycle-phase connections (feelings that appear in specific phases)
3. Theme patterns (topics that keep appearing)
4. Self-care opportunities (what they might need based on patterns)

IMPORTANT GUIDELINES:
- Be warm and supportive, never clinical or judgmental
- Focus on positive observations and gentle suggestions
- If you notice concerning patterns, frame them compassionately
- Keep insights brief and actionable
- Relate insights to their cycle phases when relevant

Respond with a JSON array of insights in this exact format:
[
  {
    "type": "pattern" | "observation" | "theme" | "suggestion",
    "title": "Short title (max 50 chars)",
    "content": "Full insight text (2-3 sentences max)",
    "confidence": 0.5 to 1.0,
    "relatedTags": ["tag1", "tag2"],
    "relatedPhases": ["menstrual", "luteal"]
  }
]

Only return the JSON array, no other text.`;

  const userMessage = `Here are the recent journal entries to analyze:

${JSON.stringify(entriesForAnalysis, null, 2)}

Please identify meaningful patterns and provide supportive insights.`;

  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-4-fast-non-reasoning",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 1000,
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      console.error("Grok API error:", response.status);
      return;
    }

    const data = (await response.json()) as GrokResponse;
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      return;
    }

    // Parse AI response
    let insights: Array<{
      type: string;
      title: string;
      content: string;
      confidence: number;
      relatedTags?: string[];
      relatedPhases?: string[];
    }>;

    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error("No JSON array found in AI response");
        return;
      }
      insights = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse AI insights:", parseError);
      return;
    }

    // Calculate date range
    const firstEntry = entries[0];
    const lastEntry = entries[entries.length - 1];
    const dateRange = {
      startDate: firstEntry?.date.toISOString() ?? new Date().toISOString(),
      endDate: lastEntry?.date.toISOString() ?? new Date().toISOString(),
    };

    // Store insights (delete old ones first to avoid duplicates)
    await prisma.journalInsight.deleteMany({
      where: {
        userId,
        createdAt: { gte: twoWeeksAgo },
      },
    });

    // Create new insights with 7-day expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    for (const insight of insights) {
      await prisma.journalInsight.create({
        data: {
          userId,
          type: insight.type,
          title: insight.title,
          content: insight.content,
          confidence: insight.confidence,
          relatedTags: insight.relatedTags
            ? JSON.stringify(insight.relatedTags)
            : null,
          relatedPhases: insight.relatedPhases
            ? JSON.stringify(insight.relatedPhases)
            : null,
          dateRange: JSON.stringify(dateRange),
          expiresAt,
        },
      });
    }

    console.log(`Generated ${insights.length} insights for user ${userId}`);
  } catch (error) {
    console.error("Pattern detection error:", error);
  }
}

export { journalRouter };
