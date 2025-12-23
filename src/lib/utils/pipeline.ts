/**
 * Function Pipeline/Middleware System
 *
 * Provides clean, chainable operations for server functions
 */

import type { Session } from "neo4j-driver";
import type { z } from "zod";
import { validate, validateOrThrow } from "./schemaValidation";
import {
  AuthenticationError,
  ForbiddenError,
  RateLimitError,
  isAppError,
  errorToResponse,
} from "./errorClasses";

/*
  Enhance Pipeline:
  - Timeout middleware
  - Conditional middleware
  - Parallel middleware execution
  - Middleware composition
 */

/**
 * Pipeline context passed through middleware
 */
export interface PipelineContext {
  data: any;
  user?: any;
  session: Session;
  request?: any;
  metadata: Record<string, any>;
}

/**
 * Middleware function type
 */
export type Middleware = (
  ctx: PipelineContext,
  next: () => Promise<any>,
) => Promise<any>;

/**
 * Pipeline configuration
 */
interface PipelineConfig {
  session: Session;
  request?: any;
  getUserFromSession?: () => Promise<any>;
  getEffectiveUser?: (
    session: Session,
    user: any,
    contextData: any,
  ) => Promise<any>;
}

/**
 * Pipeline builder class
 */
export class Pipeline {
  private middlewares: Middleware[] = [];
  private context: PipelineContext;
  private config: PipelineConfig;

  constructor(initialData: any, config: PipelineConfig) {
    this.config = config;
    this.context = {
      data: initialData,
      session: config.session,
      request: config.request,
      metadata: {},
    };
  }

  /**
   * Add middleware to pipeline
   */
  use(middleware: Middleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * Validate data against schema
   */
  validate<T>(schema: z.ZodSchema<T>): this {
    return this.use(async (ctx, next) => {
      const validated = validateOrThrow(ctx.data, schema);
      ctx.data = validated;
      return next();
    });
  }

  /**
   * Require authentication
   */
  authenticate(): this {
    return this.use(async (ctx, next) => {
      if (!this.config.getUserFromSession) {
        throw new Error("getUserFromSession not available");
      }

      const user = await this.config.getUserFromSession();
      if (!user) {
        throw new AuthenticationError();
      }

      ctx.user = user;
      ctx.metadata.authenticated = true;
      return next();
    });
  }

  /**
   * Require specific roles
   */
  authorize(...roles: string[]): this {
    return this.use(async (ctx, next) => {
      if (!ctx.user) {
        throw new AuthenticationError(
          "Authentication required for authorization",
        );
      }

      const userRoles = ctx.user.P?.roles || [];
      const hasRole = roles.some((role) => userRoles.includes(role));

      if (!hasRole) {
        throw new ForbiddenError(`Required role: ${roles.join(" or ")}`, {
          required: roles,
          user: userRoles,
        });
      }

      ctx.metadata.authorizedRoles = roles;
      return next();
    });
  }

  /**
   * Rate limiting
   */
  rateLimit(options: { max: number; window: number; key?: string }): this {
    return this.use(async (ctx, next) => {
      // Simple in-memory rate limiting
      const key =
        options.key ||
        ctx.user?.P?.uuid ||
        ctx.request?.headers?.get("x-forwarded-for") ||
        "anonymous";
      const now = Date.now();
      const windowMs = options.window * 1000;

      // Store in metadata (in production, use Redis)
      if (!global.__rateLimitStore) {
        global.__rateLimitStore = new Map();
      }

      const store = global.__rateLimitStore;
      const record = store.get(key) || { count: 0, resetAt: now + windowMs };

      if (now > record.resetAt) {
        record.count = 0;
        record.resetAt = now + windowMs;
      }

      record.count++;
      store.set(key, record);

      if (record.count > options.max) {
        const retryAfter = Math.ceil((record.resetAt - now) / 1000);
        throw new RateLimitError(
          `Rate limit exceeded. Try again in ${retryAfter} seconds`,
          retryAfter,
        );
      }

      ctx.metadata.rateLimit = {
        current: record.count,
        max: options.max,
        resetAt: record.resetAt,
      };

      return next();
    });
  }

  /**
   * Transform data
   */
  transform<T>(transformer: (data: any) => T | Promise<T>): this {
    return this.use(async (ctx, next) => {
      ctx.data = await transformer(ctx.data);
      return next();
    });
  }

  /**
   * Add custom middleware
   */
  custom(fn: (ctx: PipelineContext) => void | Promise<void>): this {
    return this.use(async (ctx, next) => {
      await fn(ctx);
      return next();
    });
  }

  /**
   * Execute pipeline with handler
   */
  async execute<T>(
    handler: (ctx: PipelineContext) => T | Promise<T>,
  ): Promise<any> {
    try {
      // Build middleware chain
      const executeChain = async (index: number): Promise<any> => {
        if (index >= this.middlewares.length) {
          // All middleware executed, run handler
          return await handler(this.context);
        }

        const middleware = this.middlewares[index];
        return await middleware(this.context, () => executeChain(index + 1));
      };

      const result = await executeChain(0);

      // Format success response
      if (result && typeof result === "object" && "success" in result) {
        return result;
      }

      return {
        success: true,
        data: result,
        metadata: this.context.metadata,
      };
    } catch (error) {
      // Format error response
      return errorToResponse(error);
    }
  }
}

/**
 * Create a new pipeline
 */
export function createPipeline(
  initialData: any,
  config: PipelineConfig,
): Pipeline {
  return new Pipeline(initialData, config);
}

/**
 * Global rate limit store type
 */
declare global {
  var __rateLimitStore:
    | Map<string, { count: number; resetAt: number }>
    | undefined;
}
