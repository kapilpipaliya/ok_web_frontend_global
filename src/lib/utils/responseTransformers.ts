/**
 * Response Transformers
 *
 * Utilities for formatting and transforming server function responses
 */

import type { Vertex } from "~/lib/graph/type/vertex";

/**
 * Standard response format
 */
export interface StandardResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorType?: string;
  statusCode?: number;
  metadata?: Record<string, any>;
}

/**
 * Paginated response format
 */
export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  metadata?: Record<string, any>;
}

/**
 * Transform options
 */
export interface TransformOptions {
  includeMetadata?: boolean;
  metadataKey?: string;
  statusCode?: number;
}

/**
 * Success response builder
 */
export function success<T>(
  data: T,
  options: TransformOptions = {}
): StandardResponse<T> {
  const response: StandardResponse<T> = {
    success: true,
    data,
    statusCode: options.statusCode || 200,
  };

  if (options.includeMetadata) {
    response.metadata = {};
  }

  return response;
}

/**
 * Error response builder
 */
export function error(
  message: string,
  errorType: string = "Error",
  statusCode: number = 500,
  details?: any
): StandardResponse {
  return {
    success: false,
    error: message,
    errorType,
    statusCode,
    metadata: details ? { details } : undefined,
  };
}

/**
 * Paginated response builder
 */
export function paginated<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  options: TransformOptions = {}
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    metadata: options.includeMetadata ? {} : undefined,
  };
}

/**
 * Transform vertex data to clean object
 */
export function vertexToObject(vertex: Vertex | null | undefined): any {
  if (!vertex) return null;
  return {
    id: vertex.id,
    ...vertex.P,
  };
}

/**
 * Transform array of vertices to clean objects
 */
export function verticesToObjects(vertices: Vertex[]): any[] {
  return vertices.map(vertexToObject);
}

/**
 * Omit fields from object
 */
export function omit<T extends Record<string, any>>(
  obj: T,
  keys: string[]
): Partial<T> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

/**
 * Pick fields from object
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
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
 * Transform vertex keeping only specified fields
 */
export function vertexPick(vertex: Vertex, fields: string[]): any {
  const obj = vertexToObject(vertex);
  return pick(obj, fields as any);
}

/**
 * Transform vertex omitting specified fields
 */
export function vertexOmit(vertex: Vertex, fields: string[]): any {
  const obj = vertexToObject(vertex);
  return omit(obj, fields);
}

/**
 * Transform nested data structure
 */
export function transform<T, R>(
  data: T,
  transformer: (item: T) => R
): R {
  return transformer(data);
}

/**
 * Transform array with mapping function
 */
export function transformArray<T, R>(
  data: T[],
  transformer: (item: T, index: number) => R
): R[] {
  return data.map(transformer);
}

/**
 * Group array by key
 */
export function groupBy<T>(
  array: T[],
  keyFn: (item: T) => string
): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const key = keyFn(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Create lookup map from array
 */
export function keyBy<T>(
  array: T[],
  keyFn: (item: T) => string
): Record<string, T> {
  return array.reduce(
    (map, item) => {
      map[keyFn(item)] = item;
      return map;
    },
    {} as Record<string, T>
  );
}

/**
 * Filter null/undefined values from object
 */
export function compact<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Flatten nested object
 */
export function flatten(
  obj: Record<string, any>,
  prefix: string = ""
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flatten(value, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

/**
 * Response transformer factory
 */
export const responses = {
  /**
   * Success response
   */
  ok: <T>(data: T, options?: TransformOptions) => success(data, options),

  /**
   * Created response (201)
   */
  created: <T>(data: T, options?: TransformOptions) =>
    success(data, { ...options, statusCode: 201 }),

  /**
   * No content response (204)
   */
  noContent: () => success(null, { statusCode: 204 }),

  /**
   * Bad request error (400)
   */
  badRequest: (message: string, details?: any) =>
    error(message, "BadRequest", 400, details),

  /**
   * Unauthorized error (401)
   */
  unauthorized: (message: string = "Authentication required") =>
    error(message, "Unauthorized", 401),

  /**
   * Forbidden error (403)
   */
  forbidden: (message: string = "Access denied") =>
    error(message, "Forbidden", 403),

  /**
   * Not found error (404)
   */
  notFound: (resource: string, identifier?: string) => {
    const message = identifier
      ? `${resource} with identifier "${identifier}" not found`
      : `${resource} not found`;
    return error(message, "NotFound", 404);
  },

  /**
   * Conflict error (409)
   */
  conflict: (message: string, details?: any) =>
    error(message, "Conflict", 409, details),

  /**
   * Server error (500)
   */
  serverError: (message: string = "Internal server error", details?: any) =>
    error(message, "ServerError", 500, details),

  /**
   * Paginated data response
   */
  paginated: <T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    options?: TransformOptions
  ) => paginated(data, page, limit, total, options),
};

/**
 * Data transformer factory
 */
export const formatters = {
  /**
   * Vertex to object
   */
  vertex: vertexToObject,

  /**
   * Array of vertices to objects
   */
  vertices: verticesToObjects,

  /**
   * Pick fields
   */
  pick: vertexPick,

  /**
   * Omit fields
   */
  omit: vertexOmit,

  /**
   * Group by key
   */
  groupBy,

  /**
   * Key by function
   */
  keyBy,

  /**
   * Compact (remove null/undefined)
   */
  compact,

  /**
   * Flatten nested object
   */
  flatten,

  /**
   * Transform single item
   */
  transform,

  /**
   * Transform array
   */
  transformArray,
};
