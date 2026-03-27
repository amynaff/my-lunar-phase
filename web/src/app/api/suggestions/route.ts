import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const suggestions = await prisma.suggestion.findMany({
    orderBy: [{ hearts: "desc" }, { createdAt: "desc" }],
    take: 50,
  });
  return NextResponse.json(suggestions);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, category, title, detail } = body;

  if (!title || !detail || !category) {
    return NextResponse.json(
      { error: "Title, detail, and category are required" },
      { status: 400 }
    );
  }

  const suggestion = await prisma.suggestion.create({
    data: {
      name: name || null,
      email: email || null,
      category,
      title,
      detail,
    },
  });

  return NextResponse.json(suggestion, { status: 201 });
}
