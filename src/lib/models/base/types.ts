/**
 * Base Types for Neogma OGM Models
 *
 * Common type definitions and utilities for all OGM models
 */

import type { Session } from "neo4j-driver";
import type { Vertex } from "~/lib/graph/type/vertex";

/**
 * Common timestamp properties for models
 */
export interface TimestampProperties {
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Base query options that can be passed to model methods
 */
export interface QueryOptions {
  session?: Session;
  limit?: number;
  skip?: number;
  orderBy?: string;
  orderDirection?: "ASC" | "DESC";
}

/**
 * Standard response format for model operations
 */
export interface ModelResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
  error?: string;
}

/**
 * Helper to convert neogma model instance to Vertex format
 *
 * This maintains compatibility with the existing Vertex-based UI components
 */
export function modelToVertex<P extends object>(
  instance: any,
  label?: string
): Vertex<P> {
  return {
    id: instance.id || instance.elementId,
    L: label ? [label] : [instance.constructor.label],
    P: instance.dataValues as P,
    IN: {},
    OUT: {},
  };
}

/**
 * Helper to convert array of model instances to Vertex format
 */
export function modelsToVertices<P extends object>(
  instances: any[],
  label?: string
): Vertex<P>[] {
  return instances.map((instance) => modelToVertex<P>(instance, label));
}

/**
 * Type guard to check if a value is a valid session
 */
export function isSession(value: any): value is Session {
  return value && typeof value.run === "function";
}

/**
 * Helper to ensure session is provided for multi-tenant operations
 */
export function requireSession(session?: Session): Session {
  if (!session || !isSession(session)) {
    throw new Error(
      "Session is required for database operations in multi-tenant architecture"
    );
  }
  return session;
}
