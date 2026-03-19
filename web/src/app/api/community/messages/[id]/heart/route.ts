import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const message = await prisma.chatMessage.update({
      where: { id },
      data: {
        hearts: { increment: 1 },
      },
      select: {
        id: true,
        hearts: true,
      },
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error adding heart to message:", error);
    return NextResponse.json(
      { error: "Failed to add heart" },
      { status: 500 }
    );
  }
}
