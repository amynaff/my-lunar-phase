import { Hono } from "hono";

const aiChatRouter = new Hono();

interface GrokResponse {
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

    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      console.error("GROK_API_KEY not found in environment");
      return c.json({ error: "AI service not configured" }, 500);
    }

    // Build messages with system prompt
    const systemPrompt = getSystemPrompt(body.lifeStage, body.currentPhase, body.moonPhase);
    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...body.messages,
    ];

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-4-fast-non-reasoning",
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Grok API error:", response.status, errorText);
      return c.json({ error: "AI service error", details: errorText }, 500);
    }

    const data = (await response.json()) as GrokResponse;
    return c.json(data);
  } catch (error) {
    console.error("AI chat error:", error);
    return c.json({ error: "Failed to process chat request" }, 500);
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

    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      return c.json({ error: "AI service not configured" }, 500);
    }

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

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-4-fast-non-reasoning",
        messages,
        max_tokens: 200,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Grok API error:", response.status, errorText);
      return c.json({ error: "AI service error" }, 500);
    }

    const data = (await response.json()) as GrokResponse;
    return c.json(data);
  } catch (error) {
    console.error("Quick advice error:", error);
    return c.json({ error: "Failed to get advice" }, 500);
  }
});

export { aiChatRouter };
