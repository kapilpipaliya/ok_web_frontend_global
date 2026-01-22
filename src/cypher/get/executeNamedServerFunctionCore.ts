import { getRequestEvent } from "solid-js/web";
import type { EvalExpressionContext } from "~/cypher/types/EvalExpressionContext";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { Edge } from "~/lib/graph/type/edge";
import type { ServerResult } from "~/cypher/types/ServerResult";
import type { Session } from "neo4j-driver";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { getDriver } from "~/cypher/core/driver";
import {
  getUserFromSession,
  getSessionUser,
} from "~/server/auth/session/getUserFromSession";
import {
  convertNodeToJson,
  neo4jConvert,
} from "~/cypher/conversion/convertNodeToJson";
import * as bullmq from "bullmq";
import { getEffectiveUser } from "~/cypher/get/admin/getEffectiveUser";
import { setImpersonation } from "~/cypher/mutate/admin/setImpersonation";
import { clearImpersonation } from "~/cypher/mutate/admin/clearImpersonation";
import * as neo4jDriver from "neo4j-driver";
import {
  getYouTubeClient,
  getValidYouTubeToken,
  hasYouTubeConnection,
  getYouTubeConnectionStatus,
  disconnectYouTube,
  getRedirectUriFromRequest,
} from "~/lib/youtube/youtubeOAuth";
import {
  YOUTUBE_API_COSTS,
  calculateOperationCost,
  // Shared quota functions
  logSharedAPIUsage,
  getTodaySharedAPIUsage,
  getSharedAPIUsageByOwnership,
  reserveQuota,
  releaseQuota,
  cleanupExpiredReservations,
  // tryBumpLowerPriorityReservations,
  DAILY_QUOTA_LIMIT,
  RESERVATION_EXPIRY_MS,
} from "~/lib/youtube/apiUsageTracking";
import {
  encryptToken,
  decryptToken,
  decryptClientSecret,
  encryptClientSecret,
} from "~/lib/auth/tokenEncryption";
import { sendEmail } from "~/lib/playwright/sendEmail";
import { createDatabaseBackup } from "~/lib/backup/createDatabaseBackup";
import { restoreFromBackup } from "~/lib/backup/restoreFromBackup";
import {
  Models,
  registerModel,
  hasModel,
  getRegisteredModels,
  modelToVertex,
  modelsToVertices,
} from "~/lib/models";
import { serverFunctionUtils } from "~/lib/utils/serverFunctionUtils";
import { cypherUtils } from "~/lib/utils/cypherUtils";
import * as crypto from "crypto";
import * as path from "path";
import { getNeogmaInstance } from "~/cypher/core/driver";
// Enhanced server function utilities
import { errors, isAppError, errorToResponse } from "~/lib/utils/errorClasses";
import {
  validate,
  validateOrThrow,
  schema,
  commonSchemas,
  createSchema,
  z,
} from "~/lib/utils/schemaValidation";
import {
  createPipeline,
  type Pipeline,
  type PipelineContext,
  type Middleware,
} from "~/lib/utils/pipeline";
import {
  transaction,
  transactionBatch,
  transactionWithRetry,
  createTransactionManager,
  type TransactionOptions,
  type TransactionManager,
} from "~/lib/utils/transactions";
import {
  checkPermissions,
  requirePermissions,
  hasRole,
  hasPermission,
  isAdmin,
  isOwner,
  type PermissionRequirement,
  type PermissionContext,
  type PermissionResult,
} from "~/lib/utils/permissions";
import {
  responses,
  formatters,
  success,
  error as createError,
  paginated,
  type StandardResponse,
  type PaginatedResponse,
} from "~/lib/utils/responseTransformers";
import {
  cache,
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheHas,
  cacheClear,
  cacheGetOrSet,
  cacheMemoize,
  createCacheManager,
  type CacheOptions,
  type CacheManager,
} from "~/lib/utils/cache";
import {
  jobs,
  registerJobHandler,
  addJob,
  getJob,
  getJobStatus,
  waitForJob,
  type Job,
  type JobHandler,
  type JobOptions,
  type QueueStats,
} from "~/lib/utils/jobs";
import {
  batch,
  batchProcess,
  batchCreateVertices,
  batchUpdateVertices,
  batchDeleteVertices,
  parallelMap,
  chunk,
  processInChunks,
  retry,
  type BatchResult,
  type BatchOptions,
} from "~/lib/utils/batch";
import { audit } from "~/lib/utils/audit";
import { circuitBreaker } from "~/lib/utils/circuitBreaker";
import { dataExport, dataImport } from "~/lib/utils/exportImport";
import { files } from "~/lib/utils/files";
import {
  clearOldLogs,
  logger,
  Logger,
  PerformanceTimer,
  queryLogs,
} from "~/lib/utils/logger";
import { rateLimit, RateLimiter } from "~/lib/utils/rateLimiter";
import { schedule } from "~/lib/utils/scheduler";
import { test } from "~/lib/utils/testing";
import { webhooks } from "~/lib/utils/webhooks";
import { updateSession } from "~/server/auth/session/updateSession";
import { executeServerFunction } from "~/cypher/get/executeServerFunction";
import {
  verifyShopifyAdminRequest,
  ensureShopDatabaseAndMigrate,
  getDBSessionForShop,
  getDatabaseNameForShop,
} from "~/lib/shopify/shopifyHelpers";
import { getShopifyClient } from "~/lib/shopify/shopifyHelpers";
import { runMigration } from "~/lib/schema/runMigration";
import { processResult } from "../conversion/processResult";

export interface NamedServerFunctionRequest {
  functionName: string;
  contextData?: any;
}

/**
 * Core function execution logic (without "use server")
 * Used by executeNamedServerFunction
 *
 * Executes server-side functions stored in the Neo4j database by:
 * 1. Fetching the function definition from database
 * 2. Creating an async function from the stored body
 * 3. Executing it with proper context and error handling
 *
 * CRITICAL FIXES:
 * - Database connection errors are now caught and serialized properly
 * - Session creation is inside try-catch to prevent H3Error serialization failures
 * - User-friendly error messages for connection issues
 *
 * @param request - Function name and context data to pass to the function
 * @param context - Execution context with nodes, relationships, and optional session
 * @returns ServerResult with function execution result or error
 *
 * @example Success Response
 * ```javascript
 * {
 *   result: {
 *     success: true,
 *     data: { ... }
 *   },
 *   graph: {
 *     edges: {},
 *     vertexes: {}
 *   }
 * }
 * ```
 *
 * @example Error Response
 * ```javascript
 * {
 *   error: "Failed to execute function 'functionName': Error message",
 *   errorType: "DatabaseConnectionError" // Optional, type of error
 * }
 * ```
 *
 * Note: When calling from client code, access the actual result via `response.result`:
 * ```javascript
 * const response = await args.executeNamedServerFunction({
 *   functionName: 'myFunction',
 *   contextData: { ... }
 * });
 * const result = response.result; // Access the actual function return value
 * if (result.success) { ... }
 * ```
 */
export async function executeNamedServerFunctionCore(
  request: NamedServerFunctionRequest,
  context: EvalExpressionContext & {
    [key: `$${string}`]: any;
  } = {
    nodes: {} as { [key: string]: Vertex },
    relationships: {} as { [key: string]: Edge },
    vertexes: undefined as any,
  },
): Promise<ServerResult> {
  // Session lifecycle tracking
  let dbSession: Session | undefined;
  let sessionCreatedLocally = false;
  let subDomain: string | undefined;

  // Function lookup session - always use fallback database for function lookup
  let functionLookupSession: Session | undefined;
  let functionLookupSessionCreated = false;

  // Save the fallback session data in an intermediate variable for reuse
  let fallbackSessionData: { dbSession: Session; subDomain: string } | undefined;

  try {
    // IMPORTANT: Session creation is inside try-catch
    // Previously this was outside, causing non-serializable Neo4j driver errors
    // to propagate unhandled, resulting in H3Error: "cannot serialize function"
    if (context.dbSession) {
      // Reuse existing session from context
      dbSession = context.dbSession;
      subDomain = context.subDomain;
    } else {
      // Note: for worker functions, this will not work, so always pass the session in the context.
      // Create new session
      sessionCreatedLocally = true;
      
      // Extract shop from request URL instead of session
      let shopFromRequest: string | undefined;
      const event = getRequestEvent();
      if (event) {
        const request = event.request;
        try {
          const urlObj = new URL(request.url);
          if (urlObj.hostname === "decodeproduct.decodecommerce.com") {
            // For decodeproduct.decodecommerce.com, get shop from Shopify authentication
            try {
              const shopify = getShopifyClient();
              const result = await shopify.authenticate.admin(request);
              shopFromRequest = result.session.shop;
            } catch (authError) {
              console.error(authError);
            }
          }
        } catch (err) {
          // ignore invalid URLs
        }
      }
      
      // Check if we should use the shop from request (if available)
      // Only use shop database if useSessionShop isn't explicitly set to false
      // and we have a shop from the request
      if (context.useSessionShop !== false && shopFromRequest) {
        // Derive database name for this shop
        subDomain = getDatabaseNameForShop(shopFromRequest);
        dbSession = (await getDriver()).session({
          database: subDomain,
        });
        context.dbSession = dbSession;
        context.subDomain = subDomain;
      } else {
        // Fallback: use standard subdomain-based session resolution
        // If getDBSessionForSubdomain() fails (e.g., Neo4j down), error is caught below
        fallbackSessionData = await getDBSessionForSubdomain();
        dbSession = fallbackSessionData.dbSession;
        subDomain = fallbackSessionData.subDomain;
        context.dbSession = dbSession;
        context.subDomain = subDomain;
      }
    }

    // Function lookup session - use provided one if available, otherwise use fallback
    // Functions are typically stored in the main/admin database, not shop-specific databases
    // But for subdomain-specific functions (like seed functions), they may be in the subdomain database
    
    if (context.functionLookupSession) {
      // Use the provided function lookup session
      functionLookupSession = context.functionLookupSession;
      functionLookupSessionCreated = false; // Don't close a session we didn't create
    } else if (context.functionLookupSubDomain) {
      // Use the specified subdomain for function lookup
      functionLookupSession = (await getDriver()).session({
        database: context.functionLookupSubDomain,
      });
      functionLookupSessionCreated = true;
    } else {
      // Fallback: use fallback database session for function lookup
      // If we already have fallbackSessionData from above, reuse it; otherwise fetch it
      if (!fallbackSessionData) {
        fallbackSessionData = await getDBSessionForSubdomain();
        functionLookupSessionCreated = true;
      }
      functionLookupSession = fallbackSessionData.dbSession;
    }
    
    // Ensure functionLookupSession is defined (should always be assigned above)
    if (!functionLookupSession) {
      return {
        error: "Failed to initialize function lookup session",
      };
    }

    // Query to find the Function vertex with the given key
    const query = `
      MATCH (f:Function {key: $functionName})
      RETURN f
    `;

    const result = await functionLookupSession.run(query, {
      functionName: request.functionName,
    });

    if (result.records.length === 0) {
      return {
        error: `Function with name '${request.functionName}' not found`,
      };
    }

    const functionVertex = result.records[0].get("f");
    const functionBody = functionVertex.properties.body;

    if (!functionBody) {
      return {
        error: `Function '${request.functionName}' has no body defined`,
      };
    }

    // Create the async function from the body stored in the database
    const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
    const serverFunction = new AsyncFunction("args", functionBody);

    // Create a context-aware executeNamedServerFunction that preserves session/subdomain
    const contextAwareExecuteNamedServerFunction = async (
      req: NamedServerFunctionRequest,
      ctx?: EvalExpressionContext & { [key: `$${string}`]: any },
    ) => {
      // Create a new session for each nested function call
      const nestedSession = (await getDriver()).session({
        database: subDomain,
      });

      try {
        // If no context provided, create one with the new session
        const executionContext = ctx || {
          dbSession: nestedSession,
          subDomain: subDomain,
          nodes: {}, // context.nodes || {},
          relationships: {}, // context.relationships || {},
          vertexes: {} as unknown as any, // context.vertexes,
        };

        return await executeNamedServerFunctionCore(req, executionContext);
      } finally {
        // Always close the session we created
        await nestedSession.close();
      }
    };

    // Helper function to execute hooks (string or string[])
    // Must be defined after contextAwareExecuteNamedServerFunction
    const executeHooks = async (hooks: string | string[] | undefined, hookContextData: any = {}) => {
      if (!hooks) return;
      
      // Normalize to array
      const hookArray = Array.isArray(hooks) ? hooks : [hooks];
      
      // Execute each hook sequentially
      for (const hookName of hookArray) {
        if (!hookName || typeof hookName !== 'string') continue;
        
        try {
          await contextAwareExecuteNamedServerFunction({
            functionName: hookName,
            contextData: hookContextData
          });
        } catch (error) {
          console.error(`Error executing hook '${hookName}':`, error);
          // Don't throw - hooks should not break the main operation
        }
      }
    };

    // Prepare the args object that will be available in the function
    const args = {
      session: dbSession,
      getSession: async () => {
        return (await getDriver()).session({
          database: subDomain,
        });
      },
      context: context,
      contextData: request.contextData || {},
      vertexes: context.vertexes || [],
      executeNamedServerFunction: contextAwareExecuteNamedServerFunction,
      executeHooks: executeHooks,
      getUserFromSession,
      convertNodeToJson,
      neo4jDriver,
      neo4jConvert,
      graph: {
        nodes: context.nodes,
        relationships: context.relationships,
      },
      functionName: request.functionName,
      bullmq,
      request: context.request,
      subDomain: subDomain,
      // driver: (await getDriver()),
      // Admin/impersonation helper functions (platform-level)
      getEffectiveUser,
      setImpersonation,
      clearImpersonation,
      // YouTube OAuth helper functions
      getYouTubeClient,
      getValidYouTubeToken,
      hasYouTubeConnection,
      getYouTubeConnectionStatus,
      disconnectYouTube,
      getRedirectUriFromRequest,
      // YouTube API costs and utilities
      YOUTUBE_API_COSTS,
      calculateOperationCost,
      // Shared quota tracking functions
      logSharedAPIUsage,
      getTodaySharedAPIUsage,
      getSharedAPIUsageByOwnership,
      reserveQuota,
      releaseQuota,
      cleanupExpiredReservations,
      // tryBumpLowerPriorityReservations,
      DAILY_QUOTA_LIMIT,
      RESERVATION_EXPIRY_MS,
      // Token encryption/decryption functions
      encryptToken,
      decryptToken,
      decryptClientSecret,
      encryptClientSecret,
      sendEmail,
      // Backup/restore functions
      createDatabaseBackup,
      restoreFromBackup,
      getDriver,
      // Neogma OGM Models registry
      Models,
      registerModel,
      hasModel,
      getRegisteredModels,
      getNeogmaInstance,
      modelToVertex,
      modelsToVertices,
      // Server function utilities
      utils: serverFunctionUtils,
      cypher: cypherUtils,
      // Node.js built-ins
      crypto,
      path,
      // Enhanced utilities
      // Error handling
      errors,
      isAppError,
      errorToResponse,
      // Validation
      validate,
      validateOrThrow,
      schema,
      commonSchemas,
      createSchema,
      z,
      // Pipeline/middleware
      createPipeline,
      // Transactions
      transaction,
      transactionBatch,
      transactionWithRetry,
      createTransactionManager,
      // Permissions
      checkPermissions,
      requirePermissions,
      hasRole,
      hasPermission,
      isAdmin,
      isOwner,
      // Response transformers
      responses,
      formatters,
      success,
      createError,
      paginated,
      // Cache
      cache,
      cacheGet,
      cacheSet,
      cacheDelete,
      cacheHas,
      cacheClear,
      cacheGetOrSet,
      cacheMemoize,
      createCacheManager,
      // Jobs
      jobs,
      registerJobHandler,
      addJob,
      getJob,
      getJobStatus,
      waitForJob,
      // Batch operations
      batch,
      batchProcess,
      batchCreateVertices,
      batchUpdateVertices,
      batchDeleteVertices,
      parallelMap,
      chunk,
      processInChunks,
      retry,
      audit,
      circuitBreaker,
      dataImport,
      dataExport,
      files,
      PerformanceTimer,
      Logger,
      logger,
      queryLogs,
      clearOldLogs,
      RateLimiter,
      rateLimit,
      schedule,
      test,
      webhooks,
      updateSession,
      // Generic server function executor (functionBody-based)
      executeServerFunction,
      // Shopify helpers
      verifyShopifyAdminRequest,
      ensureShopDatabaseAndMigrate,
      getDBSessionForShop,
      getDatabaseNameForShop,
      getShopifyClient,
      getSessionUser,
      runMigration,
      processResult,
      getRequestEvent,
    };

    // Execute the function
    const executionResult = await serverFunction(args);

    return {
      result: executionResult,
      graph: {
        edges: context.relationships!,
        vertexes: context.nodes!,
        deleted_edges: context.deletedEdges || [],
        deleted_vertexes: context.deletedVertexes || [],
      },
    };
  } catch (error: any) {
    console.error(
      `Error executing named function '${request.functionName}':`,
      error,
      error.cause,
    );

    // Error classification and message sanitization
    // Neo4j driver errors contain non-serializable objects (functions, circular refs)
    // We extract only serializable information for the API response
    let errorMessage = error.message || "Unknown error";

    // Detect database connection errors and provide helpful messages
    // These patterns indicate Neo4j server is unavailable or unreachable
    if (
      errorMessage.includes("Could not perform discovery") ||
      errorMessage.includes("connect") ||
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("database") ||
      error.code === "ServiceUnavailable"
    ) {
      errorMessage =
        "Unable to connect to the database. Please ensure the database is running and try again.";
    }

    // Return serializable error object
    // This prevents H3Error: "The value [object Function] cannot be parsed/serialized"
    return {
      error: `Failed to execute function '${request.functionName}': ${errorMessage}`,
    };
  } finally {
    // CRITICAL: Session cleanup to prevent leaks
    // Only close sessions we created in this function
    // Sessions from parent context must not be closed here
    if (sessionCreatedLocally && dbSession) {
      await dbSession.close(); // Release connection back to pool
      delete context.dbSession; // Remove from context to prevent reuse
    }
    // Close function lookup session if we created it
    if (functionLookupSessionCreated) {
      await functionLookupSession?.close();
    }
  }
}
