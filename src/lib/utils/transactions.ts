/**
 * Smart Transaction Helper
 *
 * Automatic transaction management with commit/rollback
 */

import type { Session, Transaction } from "neo4j-driver";
import { DatabaseError } from "./errorClasses";

/*
Transaction Improvement:
  - Better integration of savepoints
  - Transaction isolation levels
  - Read-only transaction optimization
*/

/**
 * Transaction options
 */
export interface TransactionOptions {
  timeout?: number; // Transaction timeout in milliseconds
  metadata?: Record<string, any>; // Transaction metadata
}

/**
 * Execute function in transaction with auto-commit/rollback
 *
 * @param session - Neo4j session
 * @param fn - Function to execute in transaction
 * @param options - Transaction options
 * @returns Result of the function
 *
 * @example
 * ```javascript
 * const result = await args.transaction(async (tx) => {
 *   const user = await args.Models.User.createOne(data, { session: tx });
 *   const profile = await args.Models.Profile.createOne(profileData, { session: tx });
 *   return { user, profile };
 * });
 * // Auto-commits on success, auto-rolls back on error
 * ```
 */
export async function transaction<T>(
  session: Session,
  fn: (tx: Transaction) => Promise<T>,
  options: TransactionOptions = {},
): Promise<T> {
  const tx = session.beginTransaction({
    timeout: options.timeout,
    metadata: options.metadata,
  });

  try {
    const result = await fn(tx);
    await tx.commit();
    return result;
  } catch (error) {
    await tx.rollback();
    throw new DatabaseError(
      `Transaction failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      {
        originalError: error,
        metadata: options.metadata,
      },
    );
  }
}

/**
 * Execute multiple operations in a single transaction
 *
 * @param session - Neo4j session
 * @param operations - Array of operations to execute
 * @param options - Transaction options
 * @returns Array of results
 *
 * @example
 * ```javascript
 * const results = await args.transactionBatch([
 *   (tx) => args.Models.User.createOne(userData1, { session: tx }),
 *   (tx) => args.Models.User.createOne(userData2, { session: tx }),
 *   (tx) => tx.run('MATCH (n) RETURN count(n)', {})
 * ]);
 * ```
 */
export async function transactionBatch<T extends any[]>(
  session: Session,
  operations: Array<(tx: Transaction) => Promise<any>>,
  options: TransactionOptions = {},
): Promise<T> {
  return transaction(
    session,
    async (tx) => {
      const results: any[] = [];
      for (const operation of operations) {
        const result = await operation(tx);
        results.push(result);
      }
      return results as T;
    },
    options,
  );
}

/**
 * Execute function with retry logic on transient failures
 *
 * @param session - Neo4j session
 * @param fn - Function to execute
 * @param maxRetries - Maximum number of retries
 * @param retryDelay - Delay between retries in milliseconds
 * @returns Result of the function
 */
export async function transactionWithRetry<T>(
  session: Session,
  fn: (tx: Transaction) => Promise<T>,
  maxRetries = 3,
  retryDelay = 1000,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await transaction(session, fn);
    } catch (error) {
      lastError = error as Error;

      // Check if error is transient (deadlock, timeout, etc.)
      const isTransient =
        error instanceof Error &&
        (error.message.includes("deadlock") ||
          error.message.includes("timeout") ||
          error.message.includes("TransientError"));

      if (!isTransient || attempt === maxRetries) {
        throw error;
      }

      // Wait before retry with exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, retryDelay * 2 ** (attempt - 1)),
      );
    }
  }

  throw lastError;
}

/**
 * Transaction helper class for more complex scenarios
 */
export class TransactionManager {
  private savepoints: string[] = [];

  constructor(private tx: Transaction) {}

  /**
   * Create a savepoint
   */
  async savepoint(name: string): Promise<void> {
    await this.tx.run(`SAVEPOINT ${name}`);
    this.savepoints.push(name);
  }

  /**
   * Rollback to savepoint
   */
  async rollbackTo(name: string): Promise<void> {
    if (!this.savepoints.includes(name)) {
      throw new Error(`Savepoint "${name}" not found`);
    }
    await this.tx.run(`ROLLBACK TO SAVEPOINT ${name}`);
  }

  /**
   * Release savepoint
   */
  async release(name: string): Promise<void> {
    if (!this.savepoints.includes(name)) {
      throw new Error(`Savepoint "${name}" not found`);
    }
    await this.tx.run(`RELEASE SAVEPOINT ${name}`);
    this.savepoints = this.savepoints.filter((sp) => sp !== name);
  }

  /**
   * Get underlying transaction
   */
  getTransaction(): Transaction {
    return this.tx;
  }
}

/**
 * Create transaction manager
 */
export function createTransactionManager(tx: Transaction): TransactionManager {
  return new TransactionManager(tx);
}
