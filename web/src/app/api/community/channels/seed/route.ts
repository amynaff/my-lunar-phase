import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_request: NextRequest) {
  try {
    const defaultChannels = [
      {
        name: "Symptoms & Support",
        description: "Share experiences and get support for symptoms",
        emoji: "heart-pulse",
        color: "#be185d",
        sortOrder: 1,
      },
      {
        name: "Fertility & TTC",
        description:
          "Trying to conceive? Connect with others on the same journey",
        emoji: "baby",
        color: "#ec4899",
        sortOrder: 2,
      },
      {
        name: "Relationships",
        description:
          "Talk about relationships, intimacy, and communication",
        emoji: "users",
        color: "#9d84ed",
        sortOrder: 3,
      },
      {
        name: "Wellness & Self-Care",
        description: "Share self-care tips and wellness routines",
        emoji: "sparkles",
        color: "#8b5cf6",
        sortOrder: 4,
      },
      {
        name: "Perimenopause Journey",
        description: "Navigate perimenopause together",
        emoji: "thermometer",
        color: "#f59e0b",
        sortOrder: 5,
      },
      {
        name: "Menopause & Beyond",
        description: "Embrace this powerful chapter of life",
        emoji: "crown",
        color: "#a78bfa",
        sortOrder: 6,
      },
    ];

    const channels = [];

    for (const channel of defaultChannels) {
      const id = channel.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const upserted = await prisma.chatChannel.upsert({
        where: { id },
        update: channel,
        create: {
          id,
          ...channel,
        },
      });
      channels.push(upserted);
    }

    return NextResponse.json({ channels });
  } catch (error) {
    console.error("Error seeding channels:", error);
    return NextResponse.json(
      { error: "Failed to seed channels" },
      { status: 500 }
    );
  }
}
