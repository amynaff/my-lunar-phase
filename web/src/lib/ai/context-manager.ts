import { callLunaAI } from "./luna-ai-client";
import {
  estimateMessagesTokens,
  MAX_CONTEXT_TOKENS,
  RESERVED_RESPONSE_TOKENS,
  KEEP_RECENT_MESSAGES,
} from "./token-counter";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function buildContextWindow(
  systemPrompt: string,
  messages: ChatMessage[],
  existingSummary?: string | null
): Promise<ChatMessage[]> {
  const systemMessage: ChatMessage = { role: "system", content: systemPrompt };
  const budget = MAX_CONTEXT_TOKENS - RESERVED_RESPONSE_TOKENS;

  if (messages.length <= KEEP_RECENT_MESSAGES) {
    const allMessages = [systemMessage, ...messages];
    if (existingSummary) {
      allMessages.splice(1, 0, {
        role: "system",
        content: `Previous conversation summary: ${existingSummary}`,
      });
    }
    return allMessages;
  }

  const recentMessages = messages.slice(-KEEP_RECENT_MESSAGES);
  const olderMessages = messages.slice(0, -KEEP_RECENT_MESSAGES);

  let summary = existingSummary || "";
  if (olderMessages.length > 0) {
    summary = await summarizeMessages(olderMessages, summary);
  }

  const contextMessages: ChatMessage[] = [systemMessage];
  if (summary) {
    contextMessages.push({
      role: "system",
      content: `Previous conversation summary: ${summary}`,
    });
  }
  contextMessages.push(...recentMessages);

  const totalTokens = estimateMessagesTokens(contextMessages);
  if (totalTokens > budget) {
    const trimmed = [systemMessage];
    if (summary) {
      trimmed.push({
        role: "system",
        content: `Previous conversation summary: ${summary}`,
      });
    }
    trimmed.push(...recentMessages.slice(-4));
    return trimmed;
  }

  return contextMessages;
}

async function summarizeMessages(
  messages: ChatMessage[],
  existingSummary: string
): Promise<string> {
  const conversationText = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const prompt = existingSummary
    ? `Here is an existing summary of an earlier part of the conversation:\n${existingSummary}\n\nHere are newer messages to incorporate:\n${conversationText}\n\nProvide an updated, concise summary (3-5 sentences) covering the key topics discussed and any important context.`
    : `Summarize this conversation concisely (3-5 sentences), capturing the key topics and important context:\n${conversationText}`;

  try {
    const response = await callLunaAI(
      [
        {
          role: "system",
          content: "You are a conversation summarizer. Be concise and factual.",
        },
        { role: "user", content: prompt },
      ],
      { maxTokens: 300, temperature: 0.3 }
    );
    return response.choices[0]?.message?.content || existingSummary;
  } catch {
    return existingSummary;
  }
}

export { type ChatMessage };
