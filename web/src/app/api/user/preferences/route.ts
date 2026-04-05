import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const data = await prisma.user.findUnique({
    where: { id: user!.id },
    select: { weeklyDigestEnabled: true },
  });

  return NextResponse.json({ weeklyDigestEnabled: data?.weeklyDigestEnabled ?? false });
}

export async function PATCH(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { weeklyDigestEnabled } = body;

  if (typeof weeklyDigestEnabled !== "boolean") {
    return NextResponse.json({ error: "Invalid value" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user!.id },
    data: { weeklyDigestEnabled },
  });

  return NextResponse.json({ weeklyDigestEnabled });
}
