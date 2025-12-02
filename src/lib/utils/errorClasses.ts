/**
 * Structured Error Classes for Server Functions
 *
 * Type-safe error classes that automatically format error responses
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: this.message,
      errorType: this.code,
      details: this.details,
      statusCode: this.statusCode,
    };
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, "ValidationError", 400, details);
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required", details?: any) {
    super(message, "AuthenticationError", 401, details);
  }
}

/**
 * Authorization/Forbidden error (403)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Access denied", details?: any) {
    super(message, "ForbiddenError", 403, details);
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier "${identifier}" not found`
      : `${resource} not found`;
    super(message, "NotFoundError", 404, { resource, identifier });
  }
}

/**
 * Conflict error (409) - e.g., duplicate key
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, "ConflictError", 409, details);
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends AppError {
  constructor(message: string = "Rate limit exceeded", retryAfter?: number) {
    super(message, "RateLimitError", 429, { retryAfter });
  }
}

/**
 * Database error (500)
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(message, "DatabaseError", 500, details);
  }
}

/**
 * External service error (502)
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(
      message || `External service "${service}" is unavailable`,
      "ExternalServiceError",
      502,
      { service }
    );
  }
}

/**
 * Business logic error (422)
 */
export class BusinessLogicError extends AppError {
  constructor(message: string, details?: any) {
    super(message, "BusinessLogicError", 422, details);
  }
}

/**
 * Error class factory for args.errors
 */
export const errors = {
  /**
   * Create validation error
   */
  Validation: (message: string, details?: any) =>
    new ValidationError(message, details),

  /**
   * Create authentication error
   */
  Authentication: (message?: string, details?: any) =>
    new AuthenticationError(message, details),

  /**
   * Create forbidden/authorization error
   */
  Forbidden: (message?: string, details?: any) =>
    new ForbiddenError(message, details),

  /**
   * Create not found error
   */
  NotFound: (resource: string, identifier?: string) =>
    new NotFoundError(resource, identifier),

  /**
   * Create conflict error
   */
  Conflict: (message: string, details?: any) =>
    new ConflictError(message, details),

  /**
   * Create rate limit error
   */
  RateLimit: (message?: string, retryAfter?: number) =>
    new RateLimitError(message, retryAfter),

  /**
   * Create database error
   */
  Database: (message: string, details?: any) =>
    new DatabaseError(message, details),

  /**
   * Create external service error
   */
  ExternalService: (service: string, message?: string) =>
    new ExternalServiceError(service, message),

  /**
   * Create business logic error
   */
  BusinessLogic: (message: string, details?: any) =>
    new BusinessLogicError(message, details),

  /**
   * Generic app error
   */
  App: (message: string, code: string, statusCode?: number, details?: any) =>
    new AppError(message, code, statusCode, details),
};

/**
 * Check if error is an AppError
 */
export function isAppError(error: any): error is AppError {
  return error instanceof AppError;
}

/**
 * Convert any error to standardized response
 */
export function errorToResponse(error: any) {
  if (isAppError(error)) {
    return error.toJSON();
  }

  // Handle standard errors
  return {
    success: false,
    error: error.message || "An unexpected error occurred",
    errorType: error.name || "Error",
    statusCode: 500,
  };
}
