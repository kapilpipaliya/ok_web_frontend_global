import { debounce } from "@solid-primitives/scheduled";
import { getRequestEvent } from "solid-js/web";
import type { EvalExpressionContext } from "~/cypher/types/EvalExpressionContext";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { Edge } from "~/lib/graph/type/edge";
import type { ServerResult } from "~/cypher/types/ServerResult";
import type { Session } from "neo4j-driver";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { getDriver } from "~/cypher/core/driver";

import { v7 as uuidv7 } from "uuid";
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
import { renderPageAsHtml } from "~/lib/playwright/renderPageAsHtml";
import { sendNotificationEmail } from "~/lib/playwright/sendNotificationEmail";
import { scrapeAmazonProduct } from "~/lib/playwright/scrapeAmazonProduct";
import { sendInvitationEmail } from "~/routes/api/users/functions/sendInvitationEmail";
import { uploadRemoteFileEntries } from "~/routes/api/file/functions/uploadFile";
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
import * as tls from "tls";
import * as dns from "dns";
import * as net from "net";
import * as fs from "fs";
import * as os from "os";
import * as child_process from "child_process";
import { getNeogmaInstance } from "~/cypher/core/driver";
import {
  countBusySlots as countAskzoomPlaywrightBusySlots,
  createEmptySlot as createAskzoomPlaywrightEmptySlot,
  clearAllSlots as clearAskzoomPlaywrightSlots,
  deleteSlot as deleteAskzoomPlaywrightSlot,
  deleteSlotIfIdle as deleteAskzoomPlaywrightSlotIfIdle,
  forEachSlot as forEachAskzoomPlaywrightSlot,
  getSlot as getAskzoomPlaywrightSlot,
  listSlots as listAskzoomPlaywrightSlots,
} from "~/lib/zoom/askzoomPlaywrightStore";
import {
  createWorkerCluster,
  shutdownAllWorkerClusters,
  type PublishAndWaitOptions,
  type WorkerClusterMetrics,
  type WorkerClusterOptions,
  type WorkerControlHandler,
  type WorkerControlMessage,
  type WorkerLease,
} from "~/lib/worker/workerCluster";
import {
  acquireAskzoomLease,
  countClusterBusySlots,
  emitAskzoomLeaseRefreshLost,
  ensureAskzoomControlBus,
  getAskzoomClusterMetrics,
  getAskzoomControlDoneTimeoutMs,
  getAskzoomLease,
  getAskzoomNodeId,
  isAskzoomLeaseOwner,
  listClusterSlots,
  publishAskzoomControl,
  publishAskzoomControlAndWait,
  reclaimAskzoomLease,
  refreshAskzoomLease,
  registerAskzoomControlHandler,
  releaseAskzoomLease,
  unregisterAskzoomControlHandler,
} from "~/lib/zoom/askzoomPlaywrightCluster";
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
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
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
  buildFolderDiskDir,
  buildUncategorizedDiskDir,
  moveFileVertexToCategoryDir,
  relocateDirectoryOnDisk,
  relocateFileOnDisk,
  resolveFolderKeyPath,
  updateFilePathsWithPrefix,
} from "~/lib/files/folderOrganize";
import { deleteFileDiskArtifacts } from "~/lib/files/deleteFileDiskArtifacts";
import {
  buildPublicImagePayload,
  buildPublicImageUrl,
} from "~/lib/files/publicImageUrl";
import { buildPublicVideoPayload } from "~/lib/files/publicMediaUrl";
import {
  cancelImageOptimizationJob,
  cancelMediaOptimizationJob,
  enqueueImageOptimization,
  enqueueMediaOptimization,
} from "~/server/queue/mediaOptimizationQueue";
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
import { getShopify } from "~/lib/shopify/shopify.server";
import {
  verifyShopifyAdminRequest,
  ensureShopDatabaseAndMigrate,
  getDBSessionForShop,
  getDatabaseNameForShop,
} from "~/lib/shopify/shopifyHelpers";
import { runMigration } from "~/lib/schema/runMigration";
import { processResult } from "../conversion/processResult";
import { cloneVertexWithEdges } from "~/lib/graph/get/sync/entity/cloneVertexWithEdges";
import { cloneVertexWithFormNestedSubgraph } from "~/lib/graph/get/sync/entity/cloneVertexWithFormNestedSubgraph";

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
 * const response = await _.executeNamedServerFunction({
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

  // Resolved shop for contextData (from request or from Shopify auth)
  let shopForContext: string | undefined = request.contextData?.shop;

  // Function lookup session - always use fallback database for function lookup
  let functionLookupSession: Session | undefined;
  let functionLookupSessionCreated = false;

  let fallbackSessionData:
    | { dbSession: Session; subDomain: string }
    | undefined;

  // Request for Shopify auth and getShopifyClient (used when building _)
  let rawRequest: Request | undefined;
  /** App subdomain from request for Shopify shop DB namespacing and getShopifyClient */
  let rawSubDomain: string | undefined;

  try {
    if (!Array.isArray(context.deletedVertexes)) context.deletedVertexes = [];
    if (!Array.isArray(context.deletedEdges)) context.deletedEdges = [];

    // IMPORTANT: Session creation is inside try-catch
    // Previously this was outside, causing non-serializable Neo4j driver errors
    // to propagate unhandled, resulting in H3Error: "cannot serialize function"
    if (context.dbSession) {
      // Reuse existing session from context
      dbSession = context.dbSession;
      subDomain = context.subDomain;
      rawSubDomain = context.rawSubDomain ?? subDomain;
      if (context.rawDbSession != null) {
        fallbackSessionData = {
          dbSession: context.rawDbSession,
          subDomain: rawSubDomain ?? "",
        };
      }
    } else {
      // Note: for worker functions, this will not work, so always pass the session in the context.
      // Create new session
      sessionCreatedLocally = true;

      // Resolve subdomain/session once for fallback and function lookup
      fallbackSessionData = await getDBSessionForSubdomain();
      rawSubDomain = fallbackSessionData.subDomain;

      // Extract shop from request URL instead of session
      let shopFromRequest: string | undefined;
      const event = getRequestEvent();
      if (event) {
        const req = event.request;
        rawRequest = req;
        try {
          if (req.headers.get("authorization")) {
            // For app subdomains, get shop from Shopify authentication
            try {
              const shopify = await getShopify(
                rawSubDomain!,
                fallbackSessionData!.dbSession,
              );
              const result = await shopify.authenticate.admin(req);
              shopFromRequest = result.session.shop;
              if (shopFromRequest)
                shopForContext = shopForContext ?? shopFromRequest;
            } catch (authError) {
              console.error(authError);
            }
          }
        } catch (err) {
          // ignore invalid URLs
        }
      }

      // Shopify support functions: always use default (central) DB so all tickets
      // are in one place and admin can see all shops' tickets
      const SUPPORT_FUNCTION_KEYS = [
        "shopifySupportCreateTicket",
        "shopifySupportListTickets",
        "shopifySupportGetConversation",
        "shopifySupportReplyAsShop",
        "shopifySupportReplyAsAdmin",
      ];
      const useCentralDbForSupport = SUPPORT_FUNCTION_KEYS.includes(
        request.functionName,
      );

      if (useCentralDbForSupport) {
        // Support tickets live in central DB so admin sees all shops
        dbSession = fallbackSessionData.dbSession;
        subDomain = fallbackSessionData.subDomain;
        context.dbSession = dbSession;
        context.subDomain = subDomain;
      } else if (context.useSessionShop !== false && shopFromRequest) {
        // Derive database name for this shop (namespaced by app subdomain)
        const shopDatabaseName = getDatabaseNameForShop(
          shopFromRequest,
          rawSubDomain,
        );
        subDomain = shopDatabaseName;
        dbSession = (await getDriver()).session({
          database: shopDatabaseName,
        });
        context.dbSession = dbSession;
        context.subDomain = subDomain;
      } else {
        // Fallback: use standard subdomain-based session resolution
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
      if (!fallbackSessionData) {
        fallbackSessionData = await getDBSessionForSubdomain(rawRequest);
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

    // Create the async function from the body stored in the database.
    // Shorthand params: _ (full bag), c (contextData), g (graph), s (executeNamedServerFunction)
    const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
    const serverFunction = new AsyncFunction("_", "c", "g", "s", functionBody);

    // Parent context (e.g. shop) to merge into hook contextData so hooks receive it without callers passing it explicitly
    const parentContextDataForHooks = {
      ...(request.contextData || {}),
      ...(shopForContext != null && request.contextData?.shop === undefined
        ? { shop: shopForContext }
        : {}),
    };

    // Create a context-aware executeNamedServerFunction.
    // When we have app context (rawSubDomain / rawDbSession), nested runs use MAIN (app) db
    // so hooks and nested functions run in app context; otherwise use current session/subdomain.
    const contextAwareExecuteNamedServerFunction = async (
      req: NamedServerFunctionRequest,
      ctx?: EvalExpressionContext & { [key: `$${string}`]: any },
    ) => {
      const nestedDbName = subDomain;
      const nestedSession = (await getDriver()).session({
        database: nestedDbName,
      });

      try {
        const executionContext: EvalExpressionContext & {
          [key: `$${string}`]: any;
        } = ctx
          ? {
              ...ctx,
              dbSession: nestedSession,
              subDomain: nestedDbName,
              rawSubDomain,
              rawDbSession: fallbackSessionData?.dbSession,
              // Keep nested lookups on the same Function catalog as the parent
              // (e.g. migrateDynamicPageSettings → getPageSettingsDefinitions),
              // BUT never override an explicit lookup target chosen by the caller.
              // Reusing the parent's (possibly shared/busy) functionLookupSession
              // for callers that want a fresh one — e.g. background workers passing
              // { functionLookupSubDomain } — causes concurrent queries on the same
              // session ("Queries cannot be run directly on a session with ongoing work").
              ...(ctx.functionLookupSession || ctx.functionLookupSubDomain
                ? {}
                : { functionLookupSession }),
            }
          : {
              dbSession: nestedSession,
              subDomain: nestedDbName,
              rawSubDomain,
              rawDbSession: fallbackSessionData?.dbSession,
              functionLookupSession,
              nodes: {},
              relationships: {},
              vertexes: {} as unknown as any,
            };

        req.contextData = {
          ...parentContextDataForHooks,
          ...(req.contextData || {}),
        };

        return await executeNamedServerFunctionCore(req, executionContext);
      } finally {
        await nestedSession.close();
      }
    };

    // Helper function to execute hooks (string or string[])
    // Must be defined after contextAwareExecuteNamedServerFunction
    const executeHooks = async (
      hooks: string | string[] | Record<string, unknown> | undefined,
      hookContextData: any = {},
    ) => {
      if (!hooks) return;

      const hookArray = Array.isArray(hooks) ? hooks : [hooks];

      for (const hook of hookArray) {
        let functionName = "";
        let extra: Record<string, unknown> = {};
        if (typeof hook === "string") {
          functionName = hook.trim();
        } else if (hook && typeof hook === "object") {
          functionName = String(
            (hook as { functionName?: string; key?: string }).functionName ||
              (hook as { functionName?: string; key?: string }).key ||
              "",
          ).trim();
          extra = hook as Record<string, unknown>;
        }
        if (!functionName) continue;

        await contextAwareExecuteNamedServerFunction(
          {
            functionName,
            contextData: { ...hookContextData, ...extra },
          },
          context,
        );
      }
    };

    // Prepare the _ object that will be available in the function
    const _ = {
      session: dbSession,
      getSession: async () => {
        return (await getDriver()).session({
          database: subDomain,
        });
      },
      context: context,
      contextData: {
        ...(request.contextData || {}),
        ...(shopForContext != null && request.contextData?.shop === undefined
          ? { shop: shopForContext }
          : {}),
      },
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
      // Generic Redis leases + pub/sub ACK (bind to current subdomain)
      workerCluster: (
        namespace: string,
        options?: Omit<WorkerClusterOptions, "namespace">,
      ) => {
        const cluster = createWorkerCluster({ namespace, ...options });
        return {
          namespace: cluster.namespace,
          nodeId: () => cluster.getNodeId(),
          ensureBus: () => cluster.ensureBus(subDomain),
          acquireLease: (ownerId: string, meta?: Record<string, unknown>) =>
            cluster.acquireLease(subDomain, ownerId, meta),
          reclaimLease: (
            ownerId: string,
            meta?: Record<string, unknown>,
            reclaimOptions?: {
              forceCloseTimeoutMs?: number;
              maxStealPttlMs?: number;
            },
          ) =>
            cluster.reclaimLease(subDomain, ownerId, meta, reclaimOptions),
          refreshLease: (
            ownerId: string,
            metaPatch?: Record<string, unknown>,
            refreshOptions?: { token?: string },
          ) =>
            cluster.refreshLease(subDomain, ownerId, metaPatch, refreshOptions),
          releaseLease: (
            ownerId: string,
            releaseOptions?: { token?: string; force?: boolean },
          ) => cluster.releaseLease(subDomain, ownerId, releaseOptions),
          getLease: (ownerId: string) => cluster.getLease(subDomain, ownerId),
          isLeaseOwner: (lease: WorkerLease | null | undefined) =>
            cluster.isLeaseOwner(lease),
          countBusy: () => cluster.countBusy(subDomain),
          listLeases: () => cluster.listLeases(subDomain),
          publish: (
            message: Omit<
              WorkerControlMessage,
              "subdomain" | "fromNodeId" | "at"
            > &
              Partial<Pick<WorkerControlMessage, "at" | "requestId">>,
          ) => cluster.publish(subDomain, message),
          publishAndWait: (
            message: Omit<
              WorkerControlMessage,
              | "subdomain"
              | "fromNodeId"
              | "at"
              | "requestId"
              | "type"
              | "ok"
              | "error"
              | "ackPhase"
            > & { type: string },
            publishOptions?: PublishAndWaitOptions,
          ) => cluster.publishAndWait(subDomain, message, publishOptions),
          registerHandler: (ownerId: string, handler: WorkerControlHandler) =>
            cluster.registerHandler(subDomain, ownerId, handler),
          unregisterHandler: (ownerId: string) =>
            cluster.unregisterHandler(subDomain, ownerId),
          getMetrics: (): WorkerClusterMetrics => cluster.getMetrics(),
          resetMetrics: () => cluster.resetMetrics(),
          shutdown: () => cluster.shutdown(),
        };
      },
      shutdownAllWorkerClusters,
      // AskZoom Playwright in-process browser slots (scoped to current subdomain)
      askzoomPlaywright: {
        getSlot: (
          userId: string,
          options?: { create?: boolean },
        ) => getAskzoomPlaywrightSlot(subDomain, userId, options),
        deleteSlot: (userId: string) =>
          deleteAskzoomPlaywrightSlot(subDomain, userId),
        deleteSlotIfIdle: (userId: string) =>
          deleteAskzoomPlaywrightSlotIfIdle(subDomain, userId),
        countBusySlots: () => countAskzoomPlaywrightBusySlots(subDomain),
        listSlots: () => listAskzoomPlaywrightSlots(subDomain),
        clearAllSlots: () => clearAskzoomPlaywrightSlots(subDomain),
        forEachSlot: (
          fn: Parameters<typeof forEachAskzoomPlaywrightSlot>[1],
        ) => forEachAskzoomPlaywrightSlot(subDomain, fn),
        createEmptySlot: createAskzoomPlaywrightEmptySlot,
        // Cluster-wide Redis leases + pub/sub (safe with NITRO_CLUSTER_WORKERS > 1)
        nodeId: () => getAskzoomNodeId(),
        ensureControlBus: () => ensureAskzoomControlBus(subDomain),
        acquireLease: (
          userId: string,
          meta?: { jobAction?: string; managing?: boolean },
        ) => acquireAskzoomLease(subDomain, userId, meta),
        reclaimLease: (
          userId: string,
          meta?: { jobAction?: string; managing?: boolean },
          reclaimOptions?: {
            forceCloseTimeoutMs?: number;
            maxStealPttlMs?: number;
          },
        ) => reclaimAskzoomLease(subDomain, userId, meta, reclaimOptions),
        refreshLease: (
          userId: string,
          patch?: { jobAction?: string; managing?: boolean },
          options?: { token?: string },
        ) => refreshAskzoomLease(subDomain, userId, patch, options),
        releaseLease: (userId: string) =>
          releaseAskzoomLease(subDomain, userId),
        getLease: (userId: string) => getAskzoomLease(subDomain, userId),
        isLeaseOwner: (lease: Parameters<typeof isAskzoomLeaseOwner>[0]) =>
          isAskzoomLeaseOwner(lease),
        countClusterBusySlots: () => countClusterBusySlots(subDomain),
        listClusterSlots: () => listClusterSlots(subDomain),
        publishControl: (
          message: Parameters<typeof publishAskzoomControl>[1],
        ) => publishAskzoomControl(subDomain, message),
        publishControlAndWait: (
          message: Parameters<typeof publishAskzoomControlAndWait>[1],
          options?: Parameters<typeof publishAskzoomControlAndWait>[2],
        ) => publishAskzoomControlAndWait(subDomain, message, options),
        registerControlHandler: (
          userId: string,
          handler: Parameters<typeof registerAskzoomControlHandler>[2],
        ) => registerAskzoomControlHandler(subDomain, userId, handler),
        unregisterControlHandler: (userId: string) =>
          unregisterAskzoomControlHandler(subDomain, userId),
        getMetrics: () => getAskzoomClusterMetrics(),
        controlDoneTimeoutMs: () => getAskzoomControlDoneTimeoutMs(),
        emitLeaseRefreshLost: (detail: {
          userId: string;
          reason?: string;
        }) =>
          emitAskzoomLeaseRefreshLost({
            ...detail,
            subdomain: subDomain,
          }),
      },
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
      renderPageAsHtml,
      sendNotificationEmail,
      scrapeAmazonProduct,
      uploadRemoteFileEntries,
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
      tls,
      dns,
      net,
      fs,
      os,
      child_process,
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
      checkRole,
      SYSTEM_ROLES,
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
      // File organizer (sidebar Folder key-path ↔ disk)
      buildFolderDiskDir,
      buildUncategorizedDiskDir,
      moveFileVertexToCategoryDir,
      relocateDirectoryOnDisk,
      relocateFileOnDisk,
      resolveFolderKeyPath,
      updateFilePathsWithPrefix,
      deleteFileDiskArtifacts,
      buildPublicImagePayload,
      buildPublicImageUrl,
      buildPublicVideoPayload,
      cancelImageOptimizationJob,
      cancelMediaOptimizationJob,
      enqueueImageOptimization,
      enqueueMediaOptimization,
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
      // Shopify helpers (request required; subdomain from request)
      verifyShopifyAdminRequest: (
        params: Parameters<typeof verifyShopifyAdminRequest>[0],
      ) => verifyShopifyAdminRequest(params, rawRequest!),
      ensureShopDatabaseAndMigrate,
      rawSubDomain: rawSubDomain,
      getDBSessionForShop,
      getDatabaseNameForShop,
      /** Same as POST `/api/users/invite`: `sendInvitationEmail(request, userVertex, subDomain, dbSession)` — use `_.request` / `getRequestEvent`, `_.subDomain`, `_.session`. */
      sendInvitationEmail,
      getShopifyClient: () => getShopify(rawSubDomain!),
      getSessionUser,
      runMigration,
      processResult,
      debounce,
      getRequestEvent,
      cloneVertexWithEdges,
      cloneVertexWithFormNestedSubgraph,
      uuidv7,
      shop: shopForContext,
    };

    // Execute the function
    const executionResult = await serverFunction(
      _,
      _.contextData,
      _.graph,
      _.executeNamedServerFunction,
    );

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
    // When we created a separate subdomain-level session, fallbackSessionData.dbSession was never assigned to dbSession — close it to avoid leaks
    if (
      sessionCreatedLocally &&
      fallbackSessionData?.dbSession &&
      fallbackSessionData.dbSession !== dbSession
    ) {
      await fallbackSessionData.dbSession.close();
    }
    // Close function lookup session if we created it
    if (functionLookupSessionCreated) {
      await functionLookupSession?.close();
    }
  }
}
