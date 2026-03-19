import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCommentSchema } from "@/lib/validations/community";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = request.nextUrl;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const comments = await prisma.storyComment.findMany({
      where: { storyId: id },
      orderBy: { createdAt: "asc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        content: true,
        hearts: true,
        createdAt: true,
      },
    });

    const total = await prisma.storyComment.count({ where: { storyId: id } });

    return NextResponse.json({
      comments,
      total,
      hasMore: offset + comments.length < total,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
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
    const parsed = createCommentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { content } = parsed.data;

    // Verify story exists
    const story = await prisma.communityStory.findUnique({ where: { id } });
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const comment = await prisma.storyComment.create({
      data: {
        storyId: id,
        content: content.trim(),
      },
      select: {
        id: true,
        content: true,
        hearts: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ comment });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
