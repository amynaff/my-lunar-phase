import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const suggestion = await prisma.suggestion.update({
    where: { id },
    data: { hearts: { increment: 1 } },
  });

  return NextResponse.json({ hearts: suggestion.hearts });
}
