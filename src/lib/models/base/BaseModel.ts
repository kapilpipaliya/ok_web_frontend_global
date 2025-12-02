/**
 * Base Model Utilities
 *
 * Shared functionality and helpers for all Neogma OGM models
 */

import type { Session } from "neo4j-driver";

/**
 * Base static methods that all models should implement
 */
export interface BaseStatics<T> {
  /**
   * Find by ID with session support
   */
  findById(id: string, session?: Session): Promise<T | null>;

  /**
   * Delete by ID with session support
   */
  deleteById(id: string, session?: Session): Promise<boolean>;
}

/**
 * Base instance methods that all models should implement
 */
export interface BaseMethods {
  /**
   * Soft delete (mark as deleted)
   */
  softDelete(session?: Session): Promise<void>;

  /**
   * Update timestamps
   */
  touch(session?: Session): Promise<void>;
}

/**
 * Utility to generate current ISO timestamp
 */
export function now(): string {
  return new Date().toISOString();
}

/**
 * Utility to add timestamps to create payload
 */
export function withTimestamps<T extends object>(
  data: T
): T & { createdAt: string; updatedAt: string } {
  return {
    ...data,
    createdAt: now(),
    updatedAt: now(),
  };
}

/**
 * Utility to update updatedAt timestamp
 */
export function touchTimestamp<T extends object>(
  data: T
): T & { updatedAt: string } {
  return {
    ...data,
    updatedAt: now(),
  };
}

/**
 * Error wrapper for model operations
 */
export class ModelError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = "ModelError";
  }
}

/**
 * Common error codes
 */
export const ErrorCodes = {
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  DUPLICATE_KEY: "DUPLICATE_KEY",
  SESSION_REQUIRED: "SESSION_REQUIRED",
  OPERATION_FAILED: "OPERATION_FAILED",
} as const;
