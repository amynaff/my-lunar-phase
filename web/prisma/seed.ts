import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultChannels = [
  {
    name: "General Wellness",
    description: "Share tips and support for overall wellness",
    emoji: "💜",
    color: "#9d84ed",
    sortOrder: 0,
  },
  {
    name: "Cycle Chat",
    description: "Discuss cycle tracking and phase-syncing",
    emoji: "🌙",
    color: "#ec4899",
    sortOrder: 1,
  },
  {
    name: "Nutrition Corner",
    description: "Share recipes and nutrition tips",
    emoji: "🍎",
    color: "#22c55e",
    sortOrder: 2,
  },
  {
    name: "Movement & Exercise",
    description: "Workout ideas and motivation",
    emoji: "💪",
    color: "#f59e0b",
    sortOrder: 3,
  },
  {
    name: "Perimenopause Support",
    description: "Support for the perimenopause journey",
    emoji: "🌗",
    color: "#f59e0b",
    sortOrder: 4,
  },
  {
    name: "Menopause Wisdom",
    description: "Sharing wisdom and support",
    emoji: "✨",
    color: "#8b5cf6",
    sortOrder: 5,
  },
];

async function main() {
  console.log("Seeding database...");

  for (const channel of defaultChannels) {
    await prisma.chatChannel.upsert({
      where: { id: channel.name.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: {
        id: channel.name.toLowerCase().replace(/\s+/g, "-"),
        ...channel,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
