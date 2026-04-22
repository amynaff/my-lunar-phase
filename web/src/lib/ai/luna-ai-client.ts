import Anthropic from "@anthropic-ai/sdk";

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

const MODEL = "claude-sonnet-4-6";

export async function callLunaAI(
  messages: ChatMessage[],
  options: { maxTokens?: number; temperature?: number } = {}
): Promise<LunaAIResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const client = new Anthropic({ apiKey });

  // Anthropic separates the system prompt from the conversation messages
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

  // Wrap in the same shape callers already expect
  return {
    choices: [{ message: { role: "assistant", content: text } }],
  };
}
