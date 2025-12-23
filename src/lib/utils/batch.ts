/**
 * Batch Operations Helper
 *
 * Utilities for batch processing and parallel operations
 */

import type { Session, Transaction } from "neo4j-driver";

/**
 * Batch operation result
 */
export interface BatchResult<T> {
  success: boolean;
  results: T[];
  errors: Array<{ index: number; error: any }>;
  successCount: number;
  errorCount: number;
}

/**
 * Batch options
 */
export interface BatchOptions {
  batchSize?: number; // Items per batch (default: 100)
  concurrency?: number; // Parallel operations (default: 5)
  continueOnError?: boolean; // Continue on individual errors (default: true)
  onProgress?: (completed: number, total: number) => void;
}

/**
 * Process items in batches
 */
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  options: BatchOptions = {},
): Promise<BatchResult<R>> {
  const {
    batchSize = 100,
    concurrency = 5,
    continueOnError = true,
    onProgress,
  } = options;

  const results: R[] = [];
  const errors: Array<{ index: number; error: any }> = [];
  let completed = 0;

  // Process in batches
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchStartIndex = i;

    // Process batch with concurrency
    const batchPromises = batch.map((item, batchIndex) => {
      const itemIndex = batchStartIndex + batchIndex;

      return processor(item, itemIndex)
        .then((result) => {
          results[itemIndex] = result;
          completed++;
          if (onProgress) {
            onProgress(completed, items.length);
          }
          return { success: true, index: itemIndex, result };
        })
        .catch((error) => {
          if (!continueOnError) {
            throw error;
          }
          errors.push({ index: itemIndex, error });
          completed++;
          if (onProgress) {
            onProgress(completed, items.length);
          }
          return { success: false, index: itemIndex, error };
        });
    });

    // Process batch with concurrency limit
    await processWithConcurrency(batchPromises, concurrency);
  }

  return {
    success: errors.length === 0,
    results,
    errors,
    successCount: items.length - errors.length,
    errorCount: errors.length,
  };
}

/**
 * Process promises with concurrency limit
 */
async function processWithConcurrency<T>(
  promises: Promise<T>[],
  concurrency: number,
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (const [index, promise] of promises.entries()) {
    const p = promise.then((result) => {
      results[index] = result;
    });

    executing.push(p);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(
        executing.findIndex((e) => e === p),
        1,
      );
    }
  }

  await Promise.all(executing);
  return results;
}

/**
 * Batch create vertices
 */
export async function batchCreateVertices<T extends Record<string, any>>(
  session: Session | Transaction,
  label: string,
  items: T[],
  options: BatchOptions = {},
): Promise<BatchResult<any>> {
  const processor = async (item: T) => {
    const keys = Object.keys(item);
    const props = keys.map((key) => `${key}: $props.${key}`).join(", ");

    const query = `
      CREATE (n:${label} {${props}})
      RETURN n
    `;

    const result = await session.run(query, { props: item });
    return result.records[0]?.get("n");
  };

  return batchProcess(items, processor, options);
}

/**
 * Batch update vertices
 */
export async function batchUpdateVertices<T extends Record<string, any>>(
  session: Session | Transaction,
  label: string,
  items: Array<{ id: string; updates: T }>,
  options: BatchOptions = {},
): Promise<BatchResult<any>> {
  const processor = async (item: { id: string; updates: T }) => {
    const keys = Object.keys(item.updates);
    const sets = keys.map((key) => `n.${key} = $updates.${key}`).join(", ");

    const query = `
      MATCH (n:${label} {id: $id})
      SET ${sets}
      RETURN n
    `;

    const result = await session.run(query, {
      id: item.id,
      updates: item.updates,
    });
    return result.records[0]?.get("n");
  };

  return batchProcess(items, processor, options);
}

/**
 * Batch delete vertices
 */
export async function batchDeleteVertices(
  session: Session | Transaction,
  label: string,
  ids: string[],
  options: BatchOptions = {},
): Promise<BatchResult<boolean>> {
  const processor = async (id: string) => {
    const query = `
      MATCH (n:${label} {id: $id})
      DELETE n
      RETURN count(n) as deleted
    `;

    const result = await session.run(query, { id });
    return result.records[0]?.get("deleted") > 0;
  };

  return batchProcess(ids, processor, options);
}

/**
 * Parallel map with concurrency limit
 */
export async function parallelMap<T, R>(
  items: T[],
  mapper: (item: T, index: number) => Promise<R>,
  concurrency = 5,
): Promise<R[]> {
  const results: R[] = [];
  const executing: Promise<void>[] = [];

  for (const [index, item] of items.entries()) {
    const p = mapper(item, index).then((result) => {
      results[index] = result;
    });

    executing.push(p);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(
        executing.findIndex((e) => e === p),
        1,
      );
    }
  }

  await Promise.all(executing);
  return results;
}

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
}

/**
 * Process array in chunks sequentially
 */
export async function processInChunks<T, R>(
  items: T[],
  processor: (chunk: T[], chunkIndex: number) => Promise<R[]>,
  chunkSize = 100,
): Promise<R[]> {
  const chunks = chunk(items, chunkSize);
  const results: R[] = [];

  for (const [index, chunk] of chunks.entries()) {
    const chunkResults = await processor(chunk, index);
    results.push(...chunkResults);
  }

  return results;
}

/**
 * Retry operation with exponential backoff
 */
export async function retry<T>(
  operation: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: number;
    onRetry?: (attempt: number, error: any) => void;
  } = {},
): Promise<T> {
  const { maxAttempts = 3, delay = 1000, backoff = 2, onRetry } = options;

  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts) {
        throw error;
      }

      if (onRetry) {
        onRetry(attempt, error);
      }

      // Wait with exponential backoff
      const waitTime = delay * backoff ** (attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}

/**
 * Debounce async function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        resolve(fn(...args));
      }, delay);
    });
  };
}

/**
 * Throttle async function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let lastRun = 0;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const now = Date.now();

    if (now - lastRun >= delay) {
      lastRun = now;
      return Promise.resolve(fn(...args));
    }

    return new Promise((resolve) => {
      setTimeout(
        () => {
          lastRun = Date.now();
          resolve(fn(...args));
        },
        delay - (now - lastRun),
      );
    });
  };
}

/**
 * Race promises with timeout
 */
export async function raceWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError = "Operation timeout",
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(timeoutError)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Batch helper factory
 */
export const batch = {
  /**
   * Process items in batches
   */
  process: batchProcess,

  /**
   * Batch create vertices
   */
  createVertices: batchCreateVertices,

  /**
   * Batch update vertices
   */
  updateVertices: batchUpdateVertices,

  /**
   * Batch delete vertices
   */
  deleteVertices: batchDeleteVertices,

  /**
   * Parallel map
   */
  map: parallelMap,

  /**
   * Chunk array
   */
  chunk,

  /**
   * Process in chunks
   */
  processChunks: processInChunks,

  /**
   * Retry with backoff
   */
  retry,

  /**
   * Debounce
   */
  debounce,

  /**
   * Throttle
   */
  throttle,

  /**
   * Race with timeout
   */
  timeout: raceWithTimeout,
};
