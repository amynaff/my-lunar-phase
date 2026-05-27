import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks: Record<string, string> = {};

  // Check DATABASE_URL is set (don't reveal it)
  const dbUrl = process.env.DATABASE_URL;
  checks.DATABASE_URL = dbUrl ? `set (${dbUrl.split("@")[1]?.split("/")[0] ?? "unknown host"})` : "MISSING";
  checks.DIRECT_URL = process.env.DIRECT_URL ? "set" : "MISSING";
  checks.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ? "set" : "MISSING";
  checks.AUTH_SECRET = process.env.AUTH_SECRET ? "set" : "MISSING";
  checks.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ? "set" : "MISSING";
  checks.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ? "set" : "MISSING";
  checks.APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID ? "set" : "MISSING";
  checks.APPLE_CLIENT_SECRET = process.env.APPLE_CLIENT_SECRET ? "set" : "MISSING";

  // Test DB connection
  try {
    const count = await prisma.user.count();
    checks.db_connection = `OK (${count} users)`;
  } catch (e: any) {
    checks.db_connection = `FAILED: ${e.message}`;
  }

  // Test bcrypt import
  try {
    const bcrypt = await import("bcryptjs");
    const hash = await bcrypt.hash("test", 4);
    checks.bcrypt = hash ? "OK" : "FAILED";
  } catch (e: any) {
    checks.bcrypt = `FAILED: ${e.message}`;
  }

  // Test NextAuth import
  try {
    const { auth } = await import("@/lib/auth");
    checks.nextauth = auth ? "OK" : "FAILED";
  } catch (e: any) {
    checks.nextauth = `FAILED: ${e.message}`;
  }

  return NextResponse.json(checks);
}
