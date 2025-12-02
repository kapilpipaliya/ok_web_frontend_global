/**
 * Advanced Rate Limiting
 *
 * Token bucket and sliding window rate limiting algorithms
 */

/**
 * Rate limit strategy
 */
export type RateLimitStrategy = "fixed-window" | "sliding-window" | "token-bucket";

/**
 * Rate limit options
 */
export interface RateLimitOptions {
  max: number; // Maximum requests
  window: number; // Time window in seconds
  strategy?: RateLimitStrategy;
  // Token bucket specific
  capacity?: number; // Token capacity (defaults to max)
  refillRate?: number; // Tokens per second (defaults to max/window)
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Rate limit record
 */
interface RateLimitRecord {
  count: number;
  resetAt: number;
  // Token bucket
  tokens?: number;
  lastRefill?: number;
  // Sliding window
  requests?: number[];
}

/**
 * Global rate limit store
 */
class RateLimitStore {
  private store: Map<string, RateLimitRecord> = new Map();

  /**
   * Get record
   */
  get(key: string): RateLimitRecord | undefined {
    return this.store.get(key);
  }

  /**
   * Set record
   */
  set(key: string, record: RateLimitRecord): void {
    this.store.set(key, record);
  }

  /**
   * Delete record
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clear all
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Cleanup expired records
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (record.resetAt < now) {
        this.store.delete(key);
      }
    }
  }
}

/**
 * Global store instance
 */
const globalStore = new RateLimitStore();

/**
 * Fixed window rate limiting
 */
function fixedWindow(
  key: string,
  options: RateLimitOptions,
  store: RateLimitStore = globalStore
): RateLimitResult {
  const now = Date.now();
  const windowMs = options.window * 1000;

  let record = store.get(key);

  if (!record || now > record.resetAt) {
    // New window
    record = {
      count: 0,
      resetAt: now + windowMs,
    };
  }

  record.count++;
  store.set(key, record);

  const allowed = record.count <= options.max;
  const remaining = Math.max(0, options.max - record.count);
  const retryAfter = allowed ? undefined : Math.ceil((record.resetAt - now) / 1000);

  return {
    allowed,
    remaining,
    resetAt: record.resetAt,
    retryAfter,
  };
}

/**
 * Sliding window rate limiting
 */
function slidingWindow(
  key: string,
  options: RateLimitOptions,
  store: RateLimitStore = globalStore
): RateLimitResult {
  const now = Date.now();
  const windowMs = options.window * 1000;

  let record = store.get(key);

  if (!record) {
    record = {
      count: 0,
      resetAt: now + windowMs,
      requests: [],
    };
  }

  // Remove requests outside window
  record.requests = (record.requests || []).filter((time) => time > now - windowMs);

  // Add current request
  record.requests.push(now);
  record.count = record.requests.length;
  record.resetAt = now + windowMs;

  store.set(key, record);

  const allowed = record.count <= options.max;
  const remaining = Math.max(0, options.max - record.count);

  // Calculate when oldest request expires
  const oldestRequest = record.requests[0];
  const retryAfter = allowed
    ? undefined
    : Math.ceil((oldestRequest + windowMs - now) / 1000);

  return {
    allowed,
    remaining,
    resetAt: record.resetAt,
    retryAfter,
  };
}

/**
 * Token bucket rate limiting
 */
function tokenBucket(
  key: string,
  tokens: number,
  options: RateLimitOptions,
  store: RateLimitStore = globalStore
): RateLimitResult {
  const now = Date.now();
  const capacity = options.capacity || options.max;
  const refillRate = options.refillRate || options.max / options.window;

  let record = store.get(key);

  if (!record) {
    record = {
      count: 0,
      resetAt: now + options.window * 1000,
      tokens: capacity,
      lastRefill: now,
    };
  }

  // Refill tokens based on time elapsed
  const elapsed = now - (record.lastRefill || now);
  const tokensToAdd = (elapsed / 1000) * refillRate;
  record.tokens = Math.min(capacity, (record.tokens || 0) + tokensToAdd);
  record.lastRefill = now;

  // Try to consume tokens
  const allowed = record.tokens >= tokens;

  if (allowed) {
    record.tokens -= tokens;
  }

  store.set(key, record);

  const remaining = Math.floor(record.tokens);
  const retryAfter = allowed
    ? undefined
    : Math.ceil((tokens - record.tokens) / refillRate);

  return {
    allowed,
    remaining,
    resetAt: record.resetAt,
    retryAfter,
  };
}

/**
 * Check rate limit
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  const strategy = options.strategy || "fixed-window";

  switch (strategy) {
    case "fixed-window":
      return fixedWindow(key, options);
    case "sliding-window":
      return slidingWindow(key, options);
    case "token-bucket":
      return tokenBucket(key, 1, options);
    default:
      throw new Error(`Unknown rate limit strategy: ${strategy}`);
  }
}

/**
 * Consume tokens (for token bucket)
 */
export function consumeTokens(
  key: string,
  tokens: number,
  options: RateLimitOptions
): RateLimitResult {
  if (options.strategy !== "token-bucket") {
    throw new Error("consumeTokens only works with token-bucket strategy");
  }

  return tokenBucket(key, tokens, options);
}

/**
 * Reset rate limit for key
 */
export function resetRateLimit(key: string): void {
  globalStore.delete(key);
}

/**
 * Clear all rate limits
 */
export function clearAllRateLimits(): void {
  globalStore.clear();
}

/**
 * Cleanup expired rate limits
 */
export function cleanupExpiredRateLimits(): void {
  globalStore.cleanup();
}

/**
 * Rate limiter class for per-instance configuration
 */
export class RateLimiter {
  private store: RateLimitStore;

  constructor(private defaultOptions: RateLimitOptions) {
    this.store = new RateLimitStore();
  }

  /**
   * Check rate limit
   */
  check(key: string, options?: Partial<RateLimitOptions>): RateLimitResult {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const strategy = mergedOptions.strategy || "fixed-window";

    switch (strategy) {
      case "fixed-window":
        return fixedWindow(key, mergedOptions, this.store);
      case "sliding-window":
        return slidingWindow(key, mergedOptions, this.store);
      case "token-bucket":
        return tokenBucket(key, 1, mergedOptions, this.store);
      default:
        throw new Error(`Unknown rate limit strategy: ${strategy}`);
    }
  }

  /**
   * Consume tokens
   */
  consume(key: string, tokens: number, options?: Partial<RateLimitOptions>): RateLimitResult {
    const mergedOptions = { ...this.defaultOptions, ...options };
    if (mergedOptions.strategy !== "token-bucket") {
      throw new Error("consume only works with token-bucket strategy");
    }
    return tokenBucket(key, tokens, mergedOptions, this.store);
  }

  /**
   * Reset key
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clear all
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Cleanup expired
   */
  cleanup(): void {
    this.store.cleanup();
  }
}

/**
 * Create rate limiter instance
 */
export function createRateLimiter(options: RateLimitOptions): RateLimiter {
  return new RateLimiter(options);
}

/**
 * Rate limiter factory
 */
export const rateLimit = {
  /**
   * Check rate limit
   */
  check: checkRateLimit,

  /**
   * Consume tokens
   */
  consume: consumeTokens,

  /**
   * Reset key
   */
  reset: resetRateLimit,

  /**
   * Clear all
   */
  clearAll: clearAllRateLimits,

  /**
   * Cleanup expired
   */
  cleanup: cleanupExpiredRateLimits,

  /**
   * Create limiter instance
   */
  create: createRateLimiter,

  /**
   * Strategy helpers
   */
  strategies: {
    fixedWindow: (max: number, window: number) => ({
      max,
      window,
      strategy: "fixed-window" as RateLimitStrategy,
    }),

    slidingWindow: (max: number, window: number) => ({
      max,
      window,
      strategy: "sliding-window" as RateLimitStrategy,
    }),

    tokenBucket: (capacity: number, refillRate: number, window: number = 60) => ({
      max: capacity,
      window,
      strategy: "token-bucket" as RateLimitStrategy,
      capacity,
      refillRate,
    }),
  },
};

/**
 * Auto-cleanup expired records every 5 minutes
 */
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      cleanupExpiredRateLimits();
    },
    5 * 60 * 1000
  );
}
