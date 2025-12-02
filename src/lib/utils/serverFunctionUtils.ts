/**
 * Server Function Utilities
 *
 * Common utilities available in all server functions via args object
 */

import { randomUUID } from "crypto";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { Edge } from "~/lib/graph/type/edge";

// ==================== ID GENERATION ====================

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return randomUUID();
}

/**
 * Generate a short unique ID (8 characters)
 */
export function generateShortId(): string {
  return randomUUID().split("-")[0];
}

/**
 * Generate a unique key from a string (slug-like)
 */
export function generateKey(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// ==================== DATE/TIME UTILITIES ====================

/**
 * Get current ISO timestamp
 */
export function now(): string {
  return new Date().toISOString();
}

/**
 * Get timestamp N days ago
 */
export function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

/**
 * Get timestamp N days from now
 */
export function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

/**
 * Parse ISO date string to Date object
 */
export function parseDate(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Check if date string is valid
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

// ==================== STRING UTILITIES ====================

/**
 * Convert string to slug (URL-friendly)
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Truncate string to max length
 */
export function truncate(str: string, maxLength: number, suffix = "..."): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert to title case
 */
export function titleCase(str: string): string {
  return str
    .split(" ")
    .map((word) => capitalize(word.toLowerCase()))
    .join(" ");
}

/**
 * Remove HTML tags from string
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

// ==================== VALIDATION UTILITIES ====================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Check if string is empty or whitespace
 */
export function isEmpty(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Check if value is null or undefined
 */
export function isNullOrUndefined(value: any): value is null | undefined {
  return value === null || value === undefined;
}

// ==================== GRAPH UTILITIES ====================

/**
 * Create a vertex object
 */
export function createVertex<P extends object = any>(
  id: string,
  labels: string[],
  properties: P
): Vertex<P> {
  return {
    id,
    L: labels,
    P: properties,
    IN: {},
    OUT: {},
  };
}

/**
 * Create an edge object
 */
export function createEdge(
  id: string,
  type: string,
  startId: string,
  endId: string,
  properties: Record<string, any> = {}
): Edge {
  return {
    id,
    T: type,
    S: startId,
    E: endId,
    P: properties,
  };
}

/**
 * Extract property from vertex safely
 */
export function getVertexProperty<T = any>(
  vertex: Vertex | null | undefined,
  propertyName: string,
  defaultValue?: T
): T | undefined {
  if (!vertex || !vertex.P) return defaultValue;
  return vertex.P[propertyName] ?? defaultValue;
}

/**
 * Check if vertex has label
 */
export function hasLabel(vertex: Vertex, label: string): boolean {
  return vertex.L.includes(label);
}

/**
 * Filter vertices by label
 */
export function filterByLabel(vertices: Vertex[], label: string): Vertex[] {
  return vertices.filter((v) => hasLabel(v, label));
}

// ==================== PAGINATION UTILITIES ====================

/**
 * Calculate pagination metadata
 */
export function calculatePagination(params: {
  total: number;
  page?: number;
  limit?: number;
}) {
  const { total, page = 1, limit = 10 } = params;
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const skip = (currentPage - 1) * limit;
  const hasNext = currentPage < totalPages;
  const hasPrev = currentPage > 1;

  return {
    total,
    page: currentPage,
    limit,
    totalPages,
    skip,
    hasNext,
    hasPrev,
    startIndex: skip + 1,
    endIndex: Math.min(skip + limit, total),
  };
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(params: {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
  success?: boolean;
  message?: string;
}) {
  const { data, total, page = 1, limit = 10, success = true, message } = params;
  const pagination = calculatePagination({ total, page, limit });

  return {
    success,
    message,
    data,
    pagination: {
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
      hasNext: pagination.hasNext,
      hasPrev: pagination.hasPrev,
    },
  };
}

// ==================== ERROR UTILITIES ====================

/**
 * Create error response
 */
export function createErrorResponse(
  error: string | Error,
  errorType = "Error",
  details?: any
) {
  const message = typeof error === "string" ? error : error.message;
  return {
    success: false,
    error: message,
    errorType,
    details,
    data: null,
  };
}

/**
 * Create success response
 */
export function createSuccessResponse<T = any>(
  data: T,
  message?: string,
  meta?: any
) {
  return {
    success: true,
    message,
    data,
    meta,
  };
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T = any>(
  jsonString: string,
  fallback: T
): T {
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
}

/**
 * Safe JSON stringify
 */
export function safeJsonStringify(
  value: any,
  fallback = "{}"
): string {
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
}

// ==================== ARRAY UTILITIES ====================

/**
 * Remove duplicates from array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
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
 * Group array by key
 */
export function groupBy<T>(
  array: T[],
  keyFn: (item: T) => string
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Sort array by key
 */
export function sortBy<T>(
  array: T[],
  keyFn: (item: T) => any,
  order: "asc" | "desc" = "asc"
): T[] {
  return [...array].sort((a, b) => {
    const aVal = keyFn(a);
    const bVal = keyFn(b);
    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });
}

// ==================== OBJECT UTILITIES ====================

/**
 * Pick specific keys from object
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Omit specific keys from object
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const output = { ...target };
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      output[key] = deepMerge(target[key] as any, source[key] as any);
    } else {
      output[key] = source[key] as any;
    }
  }
  return output;
}

// ==================== NUMBER UTILITIES ====================

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

/**
 * Round to N decimal places
 */
export function roundTo(num: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

/**
 * Generate random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ==================== ASYNC UTILITIES ====================

/**
 * Sleep for N milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry async function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    backoff?: boolean;
  } = {}
): Promise<T> {
  const { maxAttempts = 3, delayMs = 1000, backoff = true } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      const delay = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;
      await sleep(delay);
    }
  }

  throw new Error("Retry failed");
}

/**
 * Execute promises with concurrency limit
 */
export async function batchExecute<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency = 5
): Promise<R[]> {
  const results: R[] = [];
  const executing: Promise<void>[] = [];

  for (const item of items) {
    const promise = fn(item).then((result) => {
      results.push(result);
      executing.splice(executing.indexOf(promise), 1);
    });

    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}

// ==================== EXPORT ALL ====================

export const serverFunctionUtils = {
  // ID Generation
  generateUUID,
  generateShortId,
  generateKey,

  // Date/Time
  now,
  daysAgo,
  daysFromNow,
  formatDate,
  parseDate,
  isValidDate,

  // String
  slugify,
  truncate,
  capitalize,
  titleCase,
  stripHtml,
  escapeHtml,

  // Validation
  isValidEmail,
  isValidUrl,
  isValidUUID,
  isEmpty,
  isNullOrUndefined,

  // Graph
  createVertex,
  createEdge,
  getVertexProperty,
  hasLabel,
  filterByLabel,

  // Pagination
  calculatePagination,
  createPaginatedResponse,

  // Error
  createErrorResponse,
  createSuccessResponse,
  safeJsonParse,
  safeJsonStringify,

  // Array
  unique,
  chunk,
  groupBy,
  sortBy,

  // Object
  pick,
  omit,
  deepMerge,

  // Number
  clamp,
  formatNumber,
  roundTo,
  randomInt,

  // Async
  sleep,
  retry,
  batchExecute,
};
