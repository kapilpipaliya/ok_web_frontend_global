/**
 * Schema Validation System for Server Functions
 *
 * Provides Zod-based schema validation with clean API
 */

import { z } from "zod";
import { ValidationError } from "./errorClasses";

/**
 * Schema validation result
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Array<{ path: string; message: string }>;
}

/**
 * Validate data against schema
 */
export function validate<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  // Format Zod errors
  const errors = result.error.errors.map((err) => ({
    path: err.path.join("."),
    message: err.message,
  }));

  return {
    success: false,
    error: errors.map((e) => `${e.path}: ${e.message}`).join(", "),
    errors,
  };
}

/**
 * Validate and throw on error
 */
export function validateOrThrow<T>(data: unknown, schema: z.ZodSchema<T>): T {
  const result = validate(data, schema);

  if (!result.success) {
    throw new ValidationError(result.error!, result.errors);
  }

  return result.data!;
}

/**
 * Schema builder with common patterns
 */
export const schema = {
  // Re-export zod types
  string: () => z.string(),
  number: () => z.number(),
  boolean: () => z.boolean(),
  date: () => z.date(),
  array: <T extends z.ZodTypeAny>(schema: T) => z.array(schema),
  object: <T extends z.ZodRawShape>(shape: T) => z.object(shape),
  optional: <T extends z.ZodTypeAny>(schema: T) => schema.optional(),
  nullable: <T extends z.ZodTypeAny>(schema: T) => schema.nullable(),
  enum: <T extends [string, ...string[]]>(values: T) => z.enum(values),
  union: <T extends [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]>(
    schemas: T,
  ) => z.union(schemas),
  literal: <T extends z.Primitive>(value: T) => z.literal(value),
  record: <K extends z.ZodTypeAny, V extends z.ZodTypeAny>(key: K, value: V) =>
    z.record(key, value),
  tuple: <T extends [z.ZodTypeAny, ...z.ZodTypeAny[]]>(schemas: T) =>
    z.tuple(schemas),
  any: () => z.any(),
  unknown: () => z.unknown(),
  never: () => z.never(),
  void: () => z.void(),

  // Common patterns
  email: () => z.string().email("Invalid email address"),
  url: () => z.string().url("Invalid URL"),
  uuid: () =>
    z
      .string()
      .uuid("Invalid UUID format")
      .or(z.string().regex(/^[0-9]+:[a-z]+:.+$/, "Invalid Neo4j ID format")),
  positiveNumber: () => z.number().positive("Must be a positive number"),
  nonNegativeNumber: () =>
    z.number().nonnegative("Must be a non-negative number"),
  positiveInt: () => z.number().int().positive("Must be a positive integer"),
  nonEmptyString: () => z.string().min(1, "Cannot be empty"),
  isoDate: () => z.string().datetime("Invalid ISO date format").or(z.date()),

  // Custom validators
  phoneNumber: () =>
    z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  slug: () =>
    z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  hexColor: () =>
    z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  json: () =>
    z.string().transform((str, ctx) => {
      try {
        return JSON.parse(str);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid JSON",
        });
        return z.NEVER;
      }
    }),

  // Pagination schema
  pagination: () =>
    z.object({
      page: z.number().int().positive().default(1),
      limit: z.number().int().positive().max(100).default(10),
    }),

  // ID schema (Neo4j or UUID)
  id: () =>
    z
      .string()
      .regex(
        /^([0-9]+:[a-z]+:.+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i,
        "Invalid ID format",
      ),
};

const paginationSchema = schema.object({
  page: schema.number().int().positive().optional().default(1),
  limit: schema.number().int().positive().max(100).optional().default(10),
  orderBy: schema.string().optional(),
  orderDirection: schema.enum(["ASC", "DESC"]).optional().default("DESC"),
});

/**
 * Common schema patterns for reuse
 */
export const commonSchemas = {
  /**
   * User creation schema
   */
  createUser: schema.object({
    email: schema.email(),
    name: schema.string().min(2).max(100),
    password: schema.string().min(8, "Password must be at least 8 characters"),
  }),

  /**
   * Pagination params schema
   */
  pagination: paginationSchema,

  /**
   * Search params schema
   */
  search: schema.object({
    query: schema.string().min(1),
    filters: schema.record(schema.string(), schema.any()).optional(),
    ...paginationSchema.shape,
  }),

  /**
   * ID param schema
   */
  idParam: schema.object({
    id: schema.uuid(),
  }),
};

/**
 * Helper to create schema from shape
 */
export function createSchema<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape);
}

/**
 * Export zod for advanced usage
 */
export { z };
