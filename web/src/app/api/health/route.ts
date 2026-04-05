import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks: Record<string, string> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.db = "connected";
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "unknown error";
    checks.db = `error: ${message}`;
    return NextResponse.json(
      { status: "degraded", ...checks, timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }

  return NextResponse.json({
    status: "ok",
    ...checks,
    timestamp: new Date().toISOString(),
  });
}
