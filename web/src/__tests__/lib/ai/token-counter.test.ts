import { describe, it, expect } from "vitest";
import {
  estimateTokens,
  estimateMessagesTokens,
  MAX_CONTEXT_TOKENS,
  RESERVED_RESPONSE_TOKENS,
  KEEP_RECENT_MESSAGES,
} from "@/lib/ai/token-counter";

describe("estimateTokens", () => {
  it("estimates approximately 4 chars per token", () => {
    expect(estimateTokens("hello")).toBe(2); // 5/4 = 1.25, ceil = 2
    expect(estimateTokens("hello world")).toBe(3); // 11/4 = 2.75, ceil = 3
  });

  it("returns 0 for empty string", () => {
    expect(estimateTokens("")).toBe(0);
  });

  it("handles long text", () => {
    const longText = "a".repeat(1000);
    expect(estimateTokens(longText)).toBe(250);
  });
});

describe("estimateMessagesTokens", () => {
  it("counts tokens for messages with overhead", () => {
    const messages = [
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there!" },
    ];
    const tokens = estimateMessagesTokens(messages);
    // Each message: tokens + 4 overhead, plus 3 base
    expect(tokens).toBeGreaterThan(0);
    expect(tokens).toBe(3 + (2 + 4) + (3 + 4)); // 3 + 6 + 7 = 16
  });

  it("returns 3 for empty messages", () => {
    expect(estimateMessagesTokens([])).toBe(3);
  });
});

describe("constants", () => {
  it("has reasonable values", () => {
    expect(MAX_CONTEXT_TOKENS).toBe(8000);
    expect(RESERVED_RESPONSE_TOKENS).toBe(1000);
    expect(KEEP_RECENT_MESSAGES).toBe(6);
    expect(MAX_CONTEXT_TOKENS).toBeGreaterThan(RESERVED_RESPONSE_TOKENS);
  });
});
