import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { render } from "@react-email/render";
import { sendEmail } from "@/lib/email/send";
import WeeklyDigest from "@/lib/email/templates/WeeklyDigest";
import { getCurrentPhase, getDaysUntilNextPeriod } from "@/lib/cycle/phase-calculator";
import { phaseTips } from "@/lib/cycle/data";
import { decryptIfEncrypted } from "@/lib/encryption";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * GET /api/cron/weekly-digest
 * Triggered by Vercel Cron every Sunday at 9am UTC.
 * Sends a personalised weekly digest email to opted-in users.
 */
export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all users who have digest enabled and have an email
  const users = await prisma.user.findMany({
    where: {
      weeklyDigestEnabled: true,
      email: { not: undefined },
    },
    select: {
      id: true,
      name: true,
      email: true,
      cycleData: true,
    },
  });

  if (users.length === 0) {
    return NextResponse.json({ sent: 0, message: "No opted-in users" });
  }

  let sent = 0;
  let failed = 0;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://mylunarphase.com";

  for (const user of users) {
    try {
      const cycleData = user.cycleData;
      const cycleLength = cycleData?.cycleLength ?? 28;
      const periodLength = cycleData?.periodLength ?? 5;
      const lastPeriodStart = cycleData?.lastPeriodStart
        ? decryptIfEncrypted(cycleData.lastPeriodStart)
        : null;

      const phase = getCurrentPhase(lastPeriodStart, cycleLength, periodLength);
      const daysUntilNextPeriod = getDaysUntilNextPeriod(lastPeriodStart, cycleLength);
      const tips = phaseTips[phase];

      // Count mood entry streak
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentEntries = await prisma.moodEntry.count({
        where: { userId: user.id, date: { gte: sevenDaysAgo } },
      });

      const html = await render(
        WeeklyDigest({
          name: user.name?.split(" ")[0] ?? "there",
          phase,
          daysUntilNextPeriod,
          streak: recentEntries,
          nutritionTip: tips.nutrition,
          movementTip: tips.movement,
          selfcareTip: tips.selfcare,
          appUrl: `${appUrl}/dashboard`,
          unsubscribeUrl: `${appUrl}/settings`,
        })
      );

      await sendEmail({
        to: user.email,
        subject: `Your weekly wellness digest 🌙`,
        html,
      });

      sent++;
    } catch (err) {
      console.error(`Failed to send digest to user ${user.id}:`, err);
      failed++;
    }
  }

  return NextResponse.json({ sent, failed, total: users.length });
}
