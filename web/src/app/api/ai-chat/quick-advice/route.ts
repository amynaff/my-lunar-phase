import { NextRequest, NextResponse } from "next/server";
import { quickAdviceSchema } from "@/lib/validations/ai-chat";
import { getSystemPrompt, topicPrompts } from "@/lib/ai/system-prompts";
import { callLunaAI } from "@/lib/ai/luna-ai-client";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = quickAdviceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const { topic, lifeStage, currentPhase, moonPhase } = parsed.data;

    const systemPrompt = getSystemPrompt(lifeStage, currentPhase, moonPhase);
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
      { role: "user", content: topicPrompts[topic] || topicPrompts.selfcare },
    ];

    const data = await callLunaAI(messages, { maxTokens: 200, temperature: 0.8 });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Quick advice error:", err);
    return NextResponse.json({ error: "Failed to get advice" }, { status: 500 });
  }
}
