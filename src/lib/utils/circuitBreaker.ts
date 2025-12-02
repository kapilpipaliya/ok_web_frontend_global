/**
 * Circuit Breaker
 *
 * Protect against cascading failures when calling external services
 */

/**
 * Circuit states
 */
export type CircuitState = "closed" | "open" | "half-open";

/**
 * Circuit breaker options
 */
export interface CircuitBreakerOptions {
  failureThreshold: number; // Number of failures before opening
  successThreshold?: number; // Successes needed to close from half-open (default: 1)
  timeout: number; // Request timeout in milliseconds
  resetTimeout: number; // Time before trying half-open in milliseconds
  onOpen?: () => void;
  onClose?: () => void;
  onHalfOpen?: () => void;
}

/**
 * Circuit breaker stats
 */
export interface CircuitStats {
  state: CircuitState;
  failures: number;
  successes: number;
  totalCalls: number;
  lastFailureTime?: number;
  nextAttempt?: number;
}

/**
 * Circuit breaker class
 */
export class CircuitBreaker {
  private state: CircuitState = "closed";
  private failures: number = 0;
  private successes: number = 0;
  private totalCalls: number = 0;
  private lastFailureTime?: number;
  private nextAttemptTime?: number;
  private halfOpenAttempts: number = 0;

  constructor(private options: CircuitBreakerOptions) {
    if (!options.successThreshold) {
      options.successThreshold = 1;
    }
  }

  /**
   * Execute function with circuit breaker
   */
  async call<T>(fn: () => Promise<T>): Promise<T> {
    this.totalCalls++;

    // Check if circuit is open
    if (this.state === "open") {
      // Check if enough time has passed to try half-open
      if (this.nextAttemptTime && Date.now() >= this.nextAttemptTime) {
        this.transitionToHalfOpen();
      } else {
        const waitTime = this.nextAttemptTime
          ? Math.ceil((this.nextAttemptTime - Date.now()) / 1000)
          : 0;
        throw new Error(
          `Circuit breaker is open. Try again in ${waitTime} seconds.`
        );
      }
    }

    try {
      // Execute with timeout
      const result = await this.executeWithTimeout(fn, this.options.timeout);

      // Record success
      this.onSuccess();

      return result;
    } catch (error) {
      // Record failure
      this.onFailure();

      throw error;
    }
  }

  /**
   * Execute function with timeout
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Operation timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      fn()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Handle successful call
   */
  private onSuccess(): void {
    this.successes++;

    if (this.state === "half-open") {
      this.halfOpenAttempts++;

      // Check if enough successes to close circuit
      if (this.halfOpenAttempts >= (this.options.successThreshold || 1)) {
        this.transitionToClosed();
      }
    }

    // Reset failure count on success in closed state
    if (this.state === "closed") {
      this.failures = 0;
    }
  }

  /**
   * Handle failed call
   */
  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    // Check if should open circuit
    if (
      this.state === "closed" &&
      this.failures >= this.options.failureThreshold
    ) {
      this.transitionToOpen();
    } else if (this.state === "half-open") {
      // Any failure in half-open reopens the circuit
      this.transitionToOpen();
    }
  }

  /**
   * Transition to open state
   */
  private transitionToOpen(): void {
    this.state = "open";
    this.nextAttemptTime = Date.now() + this.options.resetTimeout;
    this.halfOpenAttempts = 0;

    if (this.options.onOpen) {
      this.options.onOpen();
    }
  }

  /**
   * Transition to half-open state
   */
  private transitionToHalfOpen(): void {
    this.state = "half-open";
    this.halfOpenAttempts = 0;

    if (this.options.onHalfOpen) {
      this.options.onHalfOpen();
    }
  }

  /**
   * Transition to closed state
   */
  private transitionToClosed(): void {
    this.state = "closed";
    this.failures = 0;
    this.successes = 0;
    this.nextAttemptTime = undefined;
    this.halfOpenAttempts = 0;

    if (this.options.onClose) {
      this.options.onClose();
    }
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get stats
   */
  getStats(): CircuitStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      totalCalls: this.totalCalls,
      lastFailureTime: this.lastFailureTime,
      nextAttempt: this.nextAttemptTime,
    };
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.state = "closed";
    this.failures = 0;
    this.successes = 0;
    this.totalCalls = 0;
    this.lastFailureTime = undefined;
    this.nextAttemptTime = undefined;
    this.halfOpenAttempts = 0;
  }

  /**
   * Force open (for testing/maintenance)
   */
  forceOpen(): void {
    this.transitionToOpen();
  }

  /**
   * Force close (for testing/maintenance)
   */
  forceClose(): void {
    this.transitionToClosed();
  }
}

/**
 * Global circuit breakers registry
 */
const globalBreakers = new Map<string, CircuitBreaker>();

/**
 * Create circuit breaker
 */
export function createCircuitBreaker(
  name: string,
  options: CircuitBreakerOptions
): CircuitBreaker {
  const breaker = new CircuitBreaker(options);
  globalBreakers.set(name, breaker);
  return breaker;
}

/**
 * Get circuit breaker
 */
export function getCircuitBreaker(name: string): CircuitBreaker | undefined {
  return globalBreakers.get(name);
}

/**
 * Call with circuit breaker
 */
export async function callWithCircuitBreaker<T>(
  name: string,
  fn: () => Promise<T>,
  options?: CircuitBreakerOptions
): Promise<T> {
  let breaker = globalBreakers.get(name);

  if (!breaker) {
    if (!options) {
      throw new Error(
        `Circuit breaker "${name}" not found and no options provided`
      );
    }
    breaker = createCircuitBreaker(name, options);
  }

  return breaker.call(fn);
}

/**
 * Get all circuit breakers stats
 */
export function getAllCircuitBreakersStats(): Record<string, CircuitStats> {
  const stats: Record<string, CircuitStats> = {};

  for (const [name, breaker] of globalBreakers.entries()) {
    stats[name] = breaker.getStats();
  }

  return stats;
}

/**
 * Reset circuit breaker
 */
export function resetCircuitBreaker(name: string): void {
  const breaker = globalBreakers.get(name);
  if (breaker) {
    breaker.reset();
  }
}

/**
 * Reset all circuit breakers
 */
export function resetAllCircuitBreakers(): void {
  for (const breaker of globalBreakers.values()) {
    breaker.reset();
  }
}

/**
 * Delete circuit breaker
 */
export function deleteCircuitBreaker(name: string): void {
  globalBreakers.delete(name);
}

/**
 * Circuit breaker helper factory
 */
export const circuitBreaker = {
  /**
   * Create breaker
   */
  create: createCircuitBreaker,

  /**
   * Get breaker
   */
  get: getCircuitBreaker,

  /**
   * Call with breaker
   */
  call: callWithCircuitBreaker,

  /**
   * Get all stats
   */
  stats: getAllCircuitBreakersStats,

  /**
   * Reset breaker
   */
  reset: resetCircuitBreaker,

  /**
   * Reset all
   */
  resetAll: resetAllCircuitBreakers,

  /**
   * Delete breaker
   */
  delete: deleteCircuitBreaker,

  /**
   * Preset configurations
   */
  presets: {
    /**
     * Default configuration
     */
    default: (): CircuitBreakerOptions => ({
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 3000,
      resetTimeout: 60000,
    }),

    /**
     * Aggressive (fails fast)
     */
    aggressive: (): CircuitBreakerOptions => ({
      failureThreshold: 3,
      successThreshold: 3,
      timeout: 2000,
      resetTimeout: 30000,
    }),

    /**
     * Relaxed (tolerant)
     */
    relaxed: (): CircuitBreakerOptions => ({
      failureThreshold: 10,
      successThreshold: 1,
      timeout: 5000,
      resetTimeout: 120000,
    }),

    /**
     * Critical (very sensitive)
     */
    critical: (): CircuitBreakerOptions => ({
      failureThreshold: 2,
      successThreshold: 5,
      timeout: 1000,
      resetTimeout: 20000,
    }),
  },
};
