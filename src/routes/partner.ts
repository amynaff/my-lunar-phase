import { Hono } from "hono";
import { prisma } from "../prisma";

const partnerRouter = new Hono();

// Generate a unique 6-character invite code
function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create an invite code (authenticated user creates a code to share with partner)
partnerRouter.post("/invite", async (c) => {
  const user = c.get("user" as never) as { id: string } | null;
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  // Check if user already has an active partnership
  const existingPartnership = await prisma.partnership.findFirst({
    where: { OR: [{ userId: user.id }, { partnerId: user.id }] },
  });
  if (existingPartnership) {
    return c.json({ error: "You already have a partner connected" }, 400);
  }

  // Invalidate any existing unused invites
  await prisma.partnerInvite.deleteMany({
    where: { creatorId: user.id, usedAt: null },
  });

  // Create new invite (valid for 48 hours)
  const code = generateInviteCode();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const invite = await prisma.partnerInvite.create({
    data: {
      code,
      creatorId: user.id,
      expiresAt,
    },
  });

  return c.json({ code: invite.code, expiresAt: invite.expiresAt });
});

// Accept an invite code (partner enters the code to connect)
partnerRouter.post("/accept", async (c) => {
  const user = c.get("user" as never) as { id: string } | null;
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json<{ code: string }>();
  if (!body.code) return c.json({ error: "Invite code is required" }, 400);

  const code = body.code.trim().toUpperCase();

  // Find the invite
  const invite = await prisma.partnerInvite.findUnique({
    where: { code },
    include: { creator: true },
  });

  if (!invite) {
    return c.json({ error: "Invalid invite code" }, 404);
  }

  if (invite.usedAt) {
    return c.json({ error: "This invite has already been used" }, 400);
  }

  if (new Date() > invite.expiresAt) {
    return c.json({ error: "This invite has expired" }, 400);
  }

  if (invite.creatorId === user.id) {
    return c.json({ error: "You can't accept your own invite" }, 400);
  }

  // Check if either user already has a partnership
  const existingPartnership = await prisma.partnership.findFirst({
    where: {
      OR: [
        { userId: user.id },
        { partnerId: user.id },
        { userId: invite.creatorId },
        { partnerId: invite.creatorId },
      ],
    },
  });
  if (existingPartnership) {
    return c.json({ error: "One of you already has a partner connected" }, 400);
  }

  // Create partnership and mark invite as used
  await prisma.$transaction([
    prisma.partnership.create({
      data: {
        userId: invite.creatorId,
        partnerId: user.id,
      },
    }),
    prisma.partnerInvite.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return c.json({
    success: true,
    partnerName: invite.creator.name,
  });
});

// Sync cycle data from the main user (the one being tracked)
partnerRouter.post("/sync", async (c) => {
  const user = c.get("user" as never) as { id: string } | null;
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json<{
    lifeStage: string;
    currentPhase: string;
    dayOfCycle?: number;
    cycleLength?: number;
    moonPhase?: string;
  }>();

  await prisma.sharedCycleData.upsert({
    where: { userId: user.id },
    update: {
      lifeStage: body.lifeStage,
      currentPhase: body.currentPhase,
      dayOfCycle: body.dayOfCycle ?? null,
      cycleLength: body.cycleLength ?? null,
      moonPhase: body.moonPhase ?? null,
      lastUpdated: new Date(),
    },
    create: {
      userId: user.id,
      lifeStage: body.lifeStage,
      currentPhase: body.currentPhase,
      dayOfCycle: body.dayOfCycle ?? null,
      cycleLength: body.cycleLength ?? null,
      moonPhase: body.moonPhase ?? null,
    },
  });

  return c.json({ success: true });
});

// Get partner's shared data (the partner viewing the data)
partnerRouter.get("/partner-data", async (c) => {
  const user = c.get("user" as never) as { id: string } | null;
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  // Find partnership where this user is the partner
  const partnership = await prisma.partnership.findFirst({
    where: {
      OR: [{ partnerId: user.id }, { userId: user.id }],
    },
  });

  if (!partnership) {
    return c.json({ error: "No partner connected", hasPartner: false }, 200);
  }

  // The other person's ID
  const otherUserId = partnership.userId === user.id ? partnership.partnerId : partnership.userId;

  // Check who is the "main" user (the one who created the invite / shares cycle data)
  const sharedData = await prisma.sharedCycleData.findUnique({
    where: { userId: partnership.userId },
  });

  const partnerUser = await prisma.user.findUnique({
    where: { id: otherUserId },
    select: { name: true, id: true },
  });

  return c.json({
    hasPartner: true,
    partnerName: partnerUser?.name ?? "Your partner",
    isMainUser: partnership.userId === user.id,
    sharedData: sharedData
      ? {
          lifeStage: sharedData.lifeStage,
          currentPhase: sharedData.currentPhase,
          dayOfCycle: sharedData.dayOfCycle,
          cycleLength: sharedData.cycleLength,
          moonPhase: sharedData.moonPhase,
          lastUpdated: sharedData.lastUpdated,
        }
      : null,
  });
});

// Get partnership status
partnerRouter.get("/status", async (c) => {
  const user = c.get("user" as never) as { id: string } | null;
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const partnership = await prisma.partnership.findFirst({
    where: {
      OR: [{ userId: user.id }, { partnerId: user.id }],
    },
  });

  if (!partnership) {
    // Check for pending invites
    const pendingInvite = await prisma.partnerInvite.findFirst({
      where: { creatorId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
    });

    return c.json({
      hasPartner: false,
      pendingInvite: pendingInvite
        ? { code: pendingInvite.code, expiresAt: pendingInvite.expiresAt }
        : null,
    });
  }

  const otherUserId = partnership.userId === user.id ? partnership.partnerId : partnership.userId;
  const partnerUser = await prisma.user.findUnique({
    where: { id: otherUserId },
    select: { name: true },
  });

  return c.json({
    hasPartner: true,
    isMainUser: partnership.userId === user.id,
    partnerName: partnerUser?.name ?? "Your partner",
    connectedSince: partnership.createdAt,
  });
});

// Disconnect partner
partnerRouter.delete("/disconnect", async (c) => {
  const user = c.get("user" as never) as { id: string } | null;
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const partnership = await prisma.partnership.findFirst({
    where: {
      OR: [{ userId: user.id }, { partnerId: user.id }],
    },
  });

  if (!partnership) {
    return c.json({ error: "No partner connected" }, 400);
  }

  // Delete partnership and shared data
  await prisma.$transaction([
    prisma.partnership.delete({ where: { id: partnership.id } }),
    prisma.sharedCycleData.deleteMany({ where: { userId: partnership.userId } }),
  ]);

  return c.json({ success: true });
});

export { partnerRouter };
