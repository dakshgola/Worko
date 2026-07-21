import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Define the limits per minute for each type
export const LIMITS = {
  ai: { count: 10, window: "60s", windowMs: 60000 },
  voice: { count: 5, window: "60s", windowMs: 60000 },
  realtime: { count: 20, window: "60s", windowMs: 60000 },
  db_write: { count: 40, window: "60s", windowMs: 60000 },
};

export type LimitType = keyof typeof LIMITS;

// In-memory fallback sliding window limiter for local development and single-instance deployments
// Note: This in-memory map does not share state across multiple serverless instances or regions.
// For multi-region/serverless deployments, configure Upstash Redis environment variables.
const inMemoryStore = new Map<string, number[]>();

function cleanOldRequests(timestamps: number[], windowMs: number, now: number): number[] {
  const cutoff = now - windowMs;
  return timestamps.filter((time) => time > cutoff);
}

function checkInMemoryLimit(key: string, limitType: LimitType) {
  const config = LIMITS[limitType];
  const now = Date.now();
  const storeKey = `${limitType}:${key}`;
  
  let timestamps = inMemoryStore.get(storeKey) || [];
  timestamps = cleanOldRequests(timestamps, config.windowMs, now);
  
  if (timestamps.length >= config.count) {
    const oldestTimestamp = timestamps[0];
    const resetTime = oldestTimestamp + config.windowMs;
    inMemoryStore.set(storeKey, timestamps);
    return {
      success: false,
      limit: config.count,
      remaining: 0,
      reset: resetTime,
    };
  }
  
  timestamps.push(now);
  inMemoryStore.set(storeKey, timestamps);
  
  return {
    success: true,
    limit: config.count,
    remaining: config.count - timestamps.length,
    reset: now + config.windowMs,
  };
}

// Lazy initialize Upstash Redis rate limiters
let upstashLimiters: Record<LimitType, Ratelimit> | null = null;

function getUpstashLimiters(): Record<LimitType, Ratelimit> | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  if (!upstashLimiters) {
    const redis = new Redis({
      url,
      token,
    });

    upstashLimiters = {
      ai: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(LIMITS.ai.count, LIMITS.ai.window as any),
        prefix: "@upstash/ratelimit/ai",
      }),
      voice: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(LIMITS.voice.count, LIMITS.voice.window as any),
        prefix: "@upstash/ratelimit/voice",
      }),
      realtime: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(LIMITS.realtime.count, LIMITS.realtime.window as any),
        prefix: "@upstash/ratelimit/realtime",
      }),
      db_write: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(LIMITS.db_write.count, LIMITS.db_write.window as any),
        prefix: "@upstash/ratelimit/db_write",
      }),
    };
  }

  return upstashLimiters;
}

export async function checkRateLimit(
  key: string,
  limitType: LimitType
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  try {
    const limiters = getUpstashLimiters();
    if (limiters) {
      const limiter = limiters[limitType];
      const result = await limiter.limit(key);
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      };
    }
  } catch (error) {
    console.warn("Upstash Redis connection error, falling back to in-memory limiter:", error);
  }

  // Fallback to in-memory rate limiting
  return checkInMemoryLimit(key, limitType);
}
