import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const comment = await prisma.storyComment.update({
      where: { id },
      data: {
        hearts: { increment: 1 },
      },
      select: {
        id: true,
        hearts: true,
      },
    });

    return NextResponse.json({ comment });
  } catch (error) {
    console.error("Error adding heart to comment:", error);
    return NextResponse.json(
      { error: "Failed to add heart" },
      { status: 500 }
    );
  }
}
