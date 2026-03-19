import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const lifeStage = searchParams.get("lifeStage");

    const where: Record<string, unknown> = { isApproved: true };
    if (lifeStage && lifeStage !== "all") {
      where.lifeStage = lifeStage;
    }

    const categories = await prisma.communityStory.groupBy({
      by: ["category"],
      where,
      _count: { category: true },
    });

    const total = await prisma.communityStory.count({ where });

    return NextResponse.json({
      categories: categories.map(
        (cat: { category: string; _count: { category: number } }) => ({
          name: cat.category,
          count: cat._count.category,
        })
      ),
      total,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
