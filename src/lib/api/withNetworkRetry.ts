export const NETWORK_ERROR_MESSAGE =
  "Connection problem - please check your internet and retry";

const NETWORK_MESSAGE_PATTERNS = [
  "load failed",
  "failed to fetch",
  "networkerror",
  "network request failed",
  "fetch failed",
  "networkerror when attempting to fetch resource",
  "request timed out",
  "the internet connection appears to be offline",
];

function messageLooksLikeNetworkError(message: string): boolean {
  const msg = message.toLowerCase();
  return NETWORK_MESSAGE_PATTERNS.some((pattern) => msg.includes(pattern));
}

/** Detect browser/network transport failures (Safari "Load failed", Chrome "Failed to fetch", etc.). */
export function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return typeof error === "string" && messageLooksLikeNetworkError(error);
  }
  if (error.message === NETWORK_ERROR_MESSAGE) {
    return true;
  }
  if (messageLooksLikeNetworkError(error.message)) {
    return true;
  }
  // Safari / WebKit often use TypeError for failed fetch
  if (error.name === "TypeError" && error.message.length < 40) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes("load") ||
      msg.includes("fetch") ||
      msg.includes("network")
    ) {
      return true;
    }
  }
  return false;
}

export function isNetworkErrorMessage(message?: string | null): boolean {
  if (!message) return false;
  if (message === NETWORK_ERROR_MESSAGE) return true;
  return messageLooksLikeNetworkError(message);
}

export function toUserFacingNetworkMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return NETWORK_ERROR_MESSAGE;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs = 20_000,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      fn(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error("Request timed out"));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}

export type WithNetworkRetryOptions = {
  /** Total attempts including the first call. Default 3. */
  maxAttempts?: number;
  /** Delay before attempt 2, attempt 3, ... Default [500, 1500]. */
  delaysMs?: number[];
  /** Per-attempt timeout in ms. Default 20000. Set 0 to disable. */
  timeoutMs?: number;
};

/**
 * Retry only network-level failures with backoff.
 * Safe for read-only server-function / GET calls.
 */
export async function withNetworkRetry<T>(
  fn: () => Promise<T>,
  options: WithNetworkRetryOptions = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const delaysMs = options.delaysMs ?? [500, 1500];
  const timeoutMs = options.timeoutMs ?? 20_000;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const run = () => (timeoutMs > 0 ? withTimeout(fn, timeoutMs) : fn());
      return await run();
    } catch (error) {
      lastError = error;
      const canRetry = isNetworkError(error) && attempt < maxAttempts;
      if (!canRetry) {
        throw error;
      }
      const delay = delaysMs[attempt - 1] ?? delaysMs[delaysMs.length - 1] ?? 500;
      await sleep(delay);
    }
  }

  throw lastError;
}
