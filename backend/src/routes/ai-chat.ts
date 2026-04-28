import { Hono } from "hono";
import Anthropic from "@anthropic-ai/sdk";

const aiChatRouter = new Hono();

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  lifeStage?: "regular" | "perimenopause" | "menopause" | "postmenopause";
  currentPhase?: string;
  moonPhase?: string;
}

// Shared response shape so mobile + web get the same format
interface LunaAIResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}

const MODEL = "claude-sonnet-4-6";

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");
  return new Anthropic({ apiKey });
}

async function callClaude(
  messages: ChatMessage[],
  options: { maxTokens?: number; temperature?: number } = {}
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
- ALWAYS end your responses with a brief reminder like "As always, check with your healthcare provider for personalized guidance." or a similar gentle nudge to consult a doctor — vary the wording naturally so it doesn't feel repetitive
- Keep responses concise (2-3 paragraphs max) unless the user asks for more detail
- Use occasional emojis sparingly to add warmth (🌙 ✨ 💜)

Sleep knowledge:
- Early morning wake-ups (3–4am) are not random. The body follows internal rhythms, and chronic stress can cause cortisol—a hormone that promotes alertness—to peak earlier than normal, pulling a person out of sleep prematurely.
- Blood sugar instability is another common trigger: eating refined carbohydrates or a large meal late at night can cause glucose to dip in the early hours, signaling the body to wake up.
- Environmental factors like light exposure, noise, ambient temperature, and screen use before bed all affect sleep architecture and can worsen early waking.
- Magnesium deficiency is widely underdiagnosed and can directly impair sleep quality—magnesium supports GABA pathways that calm the nervous system.
- Brain fog after a full night of sleep often points to poor sleep quality rather than insufficient duration: disrupted deep sleep, blood sugar fluctuations, dehydration, or elevated cortisol can all leave someone feeling unrefreshed.
- Cortisol and glucose are closely linked to recovery: cortisol that stays chronically elevated slows tissue repair and increases inflammation, while unstable blood sugar stresses the adrenals and disrupts hormonal balance.`;
  let contextPrompt = "";

  if (lifeStage === "regular" && currentPhase) {
    contextPrompt = `

The user is currently in their ${currentPhase} phase of their menstrual cycle. Tailor your advice to support this specific phase:
- Menstrual: Rest, iron-rich foods, gentle movement, self-compassion. Corresponds to New Moon energy.
- Follicular: Rising energy, new projects, strength training, light fresh foods. Corresponds to Waxing Moon energy.
- Ovulatory: Peak energy, social activities, high-intensity workouts, communication. Corresponds to Full Moon energy.
- Luteal: Winding down, comfort foods, moderate exercise, boundaries. Corresponds to Waning Moon energy.

Menstrual-Lunar Connection: A 2021 study in Science Advances found that women under 35 with longer cycles (closer to 29.5 days) showed intermittent synchronization between menstruation and lunar phases. While this synchronization is not universal, many women find meaning in connecting their cycles to moon phases.`;
  } else if ((lifeStage === "perimenopause" || lifeStage === "menopause" || lifeStage === "postmenopause") && moonPhase) {
    contextPrompt = `

The user is ${lifeStage === "perimenopause" ? "in perimenopause" : lifeStage === "menopause" ? "in menopause" : "post-menopausal"} and follows the moon phases for wellness guidance.
Current moon phase: ${moonPhase}

Being in tune with moon phases is a way for women in all situations—city or countryside—to connect with the rhythms of nature. For women whose menstrual cycles have become irregular or stopped, the moon provides a beautiful framework for wellness.

Complete Moon Phase Guide:
- New Moon (Dark Moon): Symbolizes new beginnings, introspection, and planting intentions. Time to set goals, cleanse energy, and embrace the unknown. Energy is inward and restorative.
- Waxing Crescent (Growing Moon): Embodies growth, action, and building momentum. Focus on intentions, take steps toward goals, cultivate positive energy.
- First Quarter (Waxing Half Moon): Signifies decision-making, overcoming obstacles, taking decisive action. Assess progress and commit to your path.
- Waxing Gibbous (Growing Full Moon): Represents refinement, preparation, and purification. Fine-tune plans, release distractions, align with purpose.
- Full Moon (Power Moon): Peak of lunar energy. Symbolizes fulfillment, revelation, celebration, and release. Time for gratitude, manifestation, and spiritual rituals.
- Waning Gibbous (Declining Moon): Emphasizes gratitude, reflection, and sharing wisdom. Acknowledge achievements and give thanks.
- Third Quarter (Last Quarter): Associated with forgiveness, letting go, and emotional cleansing. Release old patterns and make peace with the past.
- Waning Crescent (Surrender Moon): Represents rest, surrender, and spiritual renewal. Deep introspection, healing, and preparing for the next cycle.

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
