import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function createRateLimiter(requests: number, window: string) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(requests, window as any),
    analytics: true,
  });
}

export const authLimiter = createRateLimiter(5, "1 m");
export const aiLimiter = createRateLimiter(20, "1 m");
export const generalLimiter = createRateLimiter(100, "1 m");

export async function checkRateLimit(limiter: Ratelimit | null, identifier: string) {
  if (!limiter) return { success: true };
  const result = await limiter.limit(identifier);
  return { success: result.success, remaining: result.remaining };
}
