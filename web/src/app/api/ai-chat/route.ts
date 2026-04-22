import { NextRequest, NextResponse } from "next/server";
import { chatRequestSchema } from "@/lib/validations/ai-chat";
import { getSystemPrompt } from "@/lib/ai/system-prompts";
import { callLunaAI } from "@/lib/ai/luna-ai-client";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const { messages, lifeStage, currentPhase, moonPhase } = parsed.data;

    // Build messages with system prompt
    const systemPrompt = getSystemPrompt(lifeStage, currentPhase, moonPhase);
    const fullMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages,
    ];

    const data = await callLunaAI(fullMessages);
    return NextResponse.json(data);
  } catch (err) {
    console.error("AI chat error:", err);
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 });
  }
}
