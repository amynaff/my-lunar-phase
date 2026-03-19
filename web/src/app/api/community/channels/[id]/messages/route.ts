import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createMessageSchema } from "@/lib/validations/community";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = request.nextUrl;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const messages = await prisma.chatMessage.findMany({
      where: { channelId: id },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        lifeStage: true,
        content: true,
        hearts: true,
        createdAt: true,
      },
    });

    const total = await prisma.chatMessage.count({ where: { channelId: id } });

    return NextResponse.json({
      messages: messages.reverse(), // Return oldest first for chat display
      total,
      hasMore: offset + messages.length < total,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = createMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { content, lifeStage } = parsed.data;

    // Verify channel exists and is active
    const channel = await prisma.chatChannel.findUnique({ where: { id } });
    if (!channel || !channel.isActive) {
      return NextResponse.json(
        { error: "Channel not found" },
        { status: 404 }
      );
    }

    const message = await prisma.chatMessage.create({
      data: {
        channelId: id,
        content: content.trim(),
        lifeStage: lifeStage || null,
      },
      select: {
        id: true,
        lifeStage: true,
        content: true,
        hearts: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}
