export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function estimateMessagesTokens(
  messages: Array<{ role: string; content: string }>
): number {
  return messages.reduce((total, msg) => {
    return total + estimateTokens(msg.content) + 4;
  }, 3);
}

export const MAX_CONTEXT_TOKENS = 8000;
export const RESERVED_RESPONSE_TOKENS = 1000;
export const KEEP_RECENT_MESSAGES = 6;
