import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import webpush from "web-push";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * GET /api/cron/daily-reminder
 * Triggered daily at 7pm UTC (configurable via REMINDER_HOUR env var).
 * Sends a web push notification to all subscribed users who haven't logged today.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidEmail = process.env.VAPID_EMAIL ?? "support@mylunarphase.com";

  if (!vapidPublicKey || !vapidPrivateKey) {
    return NextResponse.json({ error: "VAPID keys not configured" }, { status: 503 });
  }

  webpush.setVapidDetails(`mailto:${vapidEmail}`, vapidPublicKey, vapidPrivateKey);

  // Find users with push subscriptions who haven't logged today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const subscriptions = await prisma.pushSubscription.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          moodEntries: {
            where: { date: { gte: todayStart } },
            select: { id: true },
          },
        },
      },
    },
  });

  let sent = 0;
  let skipped = 0;
  let failed = 0;
  const expired: string[] = [];

  for (const sub of subscriptions) {
    // Skip users who already logged today
    if (sub.user.moodEntries.length > 0) {
      skipped++;
      continue;
    }

    const firstName = sub.user.name?.split(" ")[0] ?? "there";

    const payload = JSON.stringify({
      title: "Daily check-in 🌙",
      body: `Hey ${firstName}, how are you feeling today? A quick log keeps your insights sharp.`,
      url: "/log",
    });

    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      );
      sent++;
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number }).statusCode;
      if (statusCode === 410 || statusCode === 404) {
        // Subscription expired — clean it up
        expired.push(sub.id);
      } else {
        console.error(`Push failed for sub ${sub.id}:`, err);
        failed++;
      }
    }
  }

  // Remove expired subscriptions
  if (expired.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: expired } } });
  }

  return NextResponse.json({ sent, skipped, failed, expired: expired.length });
}
