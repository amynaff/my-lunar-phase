import Anthropic from "@anthropic-ai/sdk";
import { env } from "../env";

// Default model for backend Claude calls. Keep in sync with routes/ai-chat.ts.
const MODEL = "claude-sonnet-4-6";

export function getAnthropicClient(): Anthropic | null {
  // ANTHROPIC_API_KEY is validated as required at startup (see src/env.ts),
  // so this is guaranteed present; the guard remains as defense in depth.
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log("ANTHROPIC_API_KEY not configured");
    return null;
  }
  return new Anthropic({ apiKey });
}

/**
 * Single-turn text generation with a system + user prompt.
 * Returns the model's text, or null if the API key is missing.
 */
export async function generateText(params: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string | null> {
  const client = getAnthropicClient();
  if (!client) return null;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: params.maxTokens ?? 500,
    temperature: params.temperature,
    system: params.system,
    messages: [{ role: "user", content: params.user }],
  });

  const textContent = response.content.find((c) => c.type === "text");
  return textContent?.type === "text" ? textContent.text : null;
}
