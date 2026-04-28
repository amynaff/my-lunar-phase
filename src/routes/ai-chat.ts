import { Hono } from "hono";
import Anthropic from "@anthropic-ai/sdk";

const aiChatRouter = new Hono();

interface LunaAIResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  lifeStage?: "regular" | "perimenopause" | "menopause";
  currentPhase?: string;
  moonPhase?: string;
}

const MODEL = "claude-sonnet-4-6";

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");
  return new Anthropic({ apiKey });
}

async function callClaude(
  messages: ChatMessage[],
  options: { maxTokens?: number } = {}
): Promise<LunaAIResponse> {
  const client = getClient();

  const systemMessages = messages.filter((m) => m.role === "system");
  const conversationMessages = messages.filter((m) => m.role !== "system");
  const systemPrompt = systemMessages.map((m) => m.content).join("\n\n");

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: options.maxTokens ?? 1000,
    system: systemPrompt || undefined,
    messages: conversationMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  const textContent = response.content.find((c) => c.type === "text");
  const text = textContent?.type === "text" ? textContent.text : "";

  return {
    choices: [{ message: { role: "assistant", content: text } }],
  };
}

// System prompt for Luna wellness assistant
const getSystemPrompt = (lifeStage?: string, currentPhase?: string, moonPhase?: string) => {
  const basePrompt = `You are Luna, a warm, knowledgeable, and empathetic AI wellness companion for women. You specialize in cycle-syncing wellness, nutrition, movement, and self-care.

Your personality:
- Warm, supportive, and encouraging like a wise friend
- Evidence-based but accessible - explain things simply
- Never preachy or judgmental
- Celebrate the user's journey at every stage
- Use gentle, feminine language that honors the body's wisdom

Important guidelines:
- Always provide practical, actionable advice
- Acknowledge that every body is different
- Never diagnose medical conditions - recommend seeing a healthcare provider for medical concerns
- Keep responses concise (2-3 paragraphs max) unless the user asks for more detail
- Use occasional emojis sparingly to add warmth (🌙 ✨ 💜)`;

  let contextPrompt = "";

  if (lifeStage === "regular" && currentPhase) {
    contextPrompt = `

The user is currently in their ${currentPhase} phase of their menstrual cycle. Tailor your advice to support this specific phase:
- Menstrual: Rest, iron-rich foods, gentle movement, self-compassion
- Follicular: Rising energy, new projects, strength training, light fresh foods
- Ovulatory: Peak energy, social activities, high-intensity workouts, communication
- Luteal: Winding down, comfort foods, moderate exercise, boundaries`;
  } else if ((lifeStage === "perimenopause" || lifeStage === "menopause") && moonPhase) {
    contextPrompt = `

The user is ${lifeStage === "perimenopause" ? "in perimenopause" : "post-menopausal"} and follows the moon phases for wellness guidance.
Current moon phase: ${moonPhase}

Moon phase guidance:
- New Moon / Waning Crescent: Rest, reflection, intention setting
- Waxing Crescent / First Quarter: New beginnings, action, building energy
- Waxing Gibbous / Full Moon: Peak energy, celebration, connection
- Waning Gibbous / Last Quarter: Gratitude, release, winding down

For ${lifeStage}:
- Emphasize strength training for bone health
- Focus on heart and brain health
- Address common symptoms (hot flashes, sleep issues, mood changes)
- Celebrate this powerful life transition`;
  }

  return basePrompt + contextPrompt;
};

aiChatRouter.post("/", async (c) => {
  try {
    const body = await c.req.json<ChatRequest>();

    if (!body.messages || !Array.isArray(body.messages)) {
      return c.json({ error: "Messages array is required" }, 400);
    }

    const systemPrompt = getSystemPrompt(body.lifeStage, body.currentPhase, body.moonPhase);
    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...body.messages,
    ];

    const data = await callClaude(messages, { maxTokens: 1000 });
    return c.json(data);
  } catch (error) {
    console.error("AI chat error:", error);
    const message = error instanceof Error ? error.message : "Failed to process chat request";
    return c.json({ error: message }, 500);
  }
});

// Quick advice endpoint for specific topics
aiChatRouter.post("/quick-advice", async (c) => {
  try {
    const body = await c.req.json<{
      topic: "nutrition" | "movement" | "selfcare" | "symptoms";
      lifeStage?: string;
      currentPhase?: string;
      moonPhase?: string;
    }>();

    const topicPrompts = {
      nutrition: "Give me a quick nutrition tip for today based on my current phase/stage. Keep it to 2-3 sentences.",
      movement: "What type of movement would be best for me today based on my current phase/stage? Keep it to 2-3 sentences.",
      selfcare: "What's one self-care practice I should prioritize today based on my current phase/stage? Keep it to 2-3 sentences.",
      symptoms: "What's one thing I can do to support my body with any symptoms I might be experiencing? Keep it to 2-3 sentences.",
    };

    const systemPrompt = getSystemPrompt(body.lifeStage, body.currentPhase, body.moonPhase);
    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: topicPrompts[body.topic] || topicPrompts.selfcare },
    ];

    const data = await callClaude(messages, { maxTokens: 200 });
    return c.json(data);
  } catch (error) {
    console.error("Quick advice error:", error);
    return c.json({ error: "Failed to get advice" }, 500);
  }
});

export { aiChatRouter };

// Symptom checker endpoint
aiChatRouter.post("/symptom-check", async (c) => {
  try {
    const body = await c.req.json<{
      symptoms: string[];
      severity?: "mild" | "moderate" | "severe";
      duration?: string;
      lifeStage?: string;
      currentPhase?: string;
      moonPhase?: string;
    }>();

    if (!body.symptoms || !Array.isArray(body.symptoms) || body.symptoms.length === 0) {
      return c.json({ error: "At least one symptom is required" }, 400);
    }

    const symptomCheckerPrompt = `You are Luna, a caring wellness companion helping a woman understand her symptoms.

IMPORTANT GUIDELINES:
- You are NOT a doctor and cannot diagnose conditions
- Always recommend consulting a healthcare provider for persistent or concerning symptoms
- Be warm, supportive, and non-alarmist
- Provide practical comfort measures and lifestyle adjustments
- Relate symptoms to the user's life stage/cycle phase when relevant

The user is reporting the following:
- Symptoms: ${body.symptoms.join(", ")}
${body.severity ? `- Severity: ${body.severity}` : ""}
${body.duration ? `- Duration: ${body.duration}` : ""}
${body.lifeStage ? `- Life stage: ${body.lifeStage}` : ""}
${body.currentPhase ? `- Cycle phase: ${body.currentPhase}` : ""}
${body.moonPhase ? `- Moon phase: ${body.moonPhase}` : ""}

Please provide:
1. A brief, compassionate acknowledgment of what they're experiencing
2. Whether these symptoms are common for their life stage/phase (if applicable)
3. 2-3 practical self-care suggestions to help with these specific symptoms
4. Clear guidance on when they should consult a healthcare provider

Keep your response warm and supportive, around 3-4 paragraphs.`;

    const messages: ChatMessage[] = [
      { role: "system", content: symptomCheckerPrompt },
      { role: "user", content: `I'm experiencing: ${body.symptoms.join(", ")}` },
    ];

    const data = await callClaude(messages, { maxTokens: 800 });
    return c.json(data);
  } catch (error) {
    console.error("Symptom check error:", error);
    return c.json({ error: "Failed to process symptom check" }, 500);
  }
});
