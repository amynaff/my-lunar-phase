import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createStorySchema } from "@/lib/validations/community";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get("category");
    const lifeStage = searchParams.get("lifeStage");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Record<string, unknown> = {
      isApproved: true,
    };

    if (category && category !== "all") {
      where.category = category;
    }

    if (lifeStage && lifeStage !== "all") {
      where.lifeStage = lifeStage;
    }

    const stories = await prisma.communityStory.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        category: true,
        lifeStage: true,
        title: true,
        content: true,
        hearts: true,
        createdAt: true,
        _count: {
          select: { comments: true },
        },
      },
    });

    const total = await prisma.communityStory.count({ where });

    return NextResponse.json({
      stories: stories.map((s) => ({
        ...s,
        commentCount: s._count.comments,
        _count: undefined,
      })),
      total,
      hasMore: offset + stories.length < total,
    });
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createStorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { category, lifeStage, title, content } = parsed.data;

    const story = await prisma.communityStory.create({
      data: {
        category,
        lifeStage,
        title: title.trim(),
        content: content.trim(),
      },
      select: {
        id: true,
        category: true,
        lifeStage: true,
        title: true,
        content: true,
        hearts: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ story: { ...story, commentCount: 0 } });
  } catch (error) {
    console.error("Error creating story:", error);
    return NextResponse.json(
      { error: "Failed to create story" },
      { status: 500 }
    );
  }
}
