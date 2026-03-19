import { NextRequest, NextResponse } from "next/server";
import { symptomCheckSchema } from "@/lib/validations/ai-chat";
import { getSymptomCheckerPrompt } from "@/lib/ai/system-prompts";
import { callGrok } from "@/lib/ai/grok-client";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = symptomCheckSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const { symptoms, severity, duration, lifeStage, currentPhase, moonPhase } = parsed.data;

    const symptomPrompt = getSymptomCheckerPrompt(
      symptoms,
      severity,
      duration,
      lifeStage,
      currentPhase,
      moonPhase
    );

    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: symptomPrompt },
      { role: "user", content: `I'm experiencing: ${symptoms.join(", ")}` },
    ];

    const data = await callGrok(messages, { maxTokens: 800, temperature: 0.6 });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Symptom check error:", err);
    return NextResponse.json({ error: "Failed to process symptom check" }, { status: 500 });
  }
}
