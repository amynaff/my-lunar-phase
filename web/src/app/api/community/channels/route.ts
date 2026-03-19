import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  try {
    const channels = await prisma.chatChannel.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        emoji: true,
        color: true,
        _count: {
          select: { messages: true },
        },
      },
    });

    return NextResponse.json({
      channels: channels.map((ch) => ({
        ...ch,
        messageCount: ch._count.messages,
        _count: undefined,
      })),
    });
  } catch (error) {
    console.error("Error fetching channels:", error);
    return NextResponse.json(
      { error: "Failed to fetch channels" },
      { status: 500 }
    );
  }
}
