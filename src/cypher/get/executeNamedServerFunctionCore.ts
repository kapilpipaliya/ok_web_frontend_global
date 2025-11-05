import type {EvalExpressionContext} from "~/cypher/types/EvalExpressionContext";
import type {Vertex} from "~/lib/graph/type/vertex";
import type {Edge} from "~/lib/graph/type/edge";
import type {ServerResult} from "~/cypher/types/ServerResult";
import type {Session} from "neo4j-driver";
import {getDBSessionForSubdomain} from "~/cypher/session/getSessionForSubdomain";
import {getUserFromSession} from "~/server/auth/session/getUserFromSession";
import {convertNodeToJson, neo4jConvert} from "~/cypher/conversion/convertNodeToJson";
import * as bullmq from "bullmq";
import {getEffectiveUser} from "~/cypher/get/admin/getEffectiveUser";
import {setImpersonation} from "~/cypher/mutate/admin/setImpersonation";
import {clearImpersonation} from "~/cypher/mutate/admin/clearImpersonation";
import {executeNamedServerFunction} from "~/cypher/get/executeNamedServerFunction";
import * as neo4jDriver from "neo4j-driver";

export interface NamedServerFunctionRequest {
  functionName: string;
  contextData?: any;
}

/**
 * Core function execution logic (without "use server")
 * Used by both executeNamedServerFunction and executeNamedServerFunctionDirect
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

  try {
    // IMPORTANT: Session creation is inside try-catch
    // Previously this was outside, causing non-serializable Neo4j driver errors
    // to propagate unhandled, resulting in H3Error: "cannot serialize function"
    if (context.dbSession) {
      // Reuse existing session from context
      dbSession = context.dbSession;
    } else {
      // Create new session
      // If getDBSessionForSubdomain() fails (e.g., Neo4j down), error is caught below
      ({dbSession} = await getDBSessionForSubdomain());
      sessionCreatedLocally = true;
      context.dbSession = dbSession;
    }
    // Query to find the Function vertex with the given key
    const query = `
      MATCH (f:Function {key: $functionName})
      RETURN f
    `;

    const result = await dbSession.run(query, {
      functionName: request.functionName,
    });

    if (result.records.length === 0) {
      return {
        error: `Function with name '${request.functionName}' not found`
      };
    }

    const functionVertex = result.records[0].get('f');
    const functionBody = functionVertex.properties.body;

    if (!functionBody) {
      return {
        error: `Function '${request.functionName}' has no body defined`
      };
    }

    // Create the async function from the body stored in the database
    const AsyncFunction = Object.getPrototypeOf(
      async function () {
      },
    ).constructor;
    const serverFunction = new AsyncFunction("args", functionBody);

    // Prepare the args object that will be available in the function
    const args = {
      session: dbSession,
      getSession: getDBSessionForSubdomain,
      context: context,
      contextData: request.contextData || {},
      vertexes: context.vertexes || [],
      executeNamedServerFunction,
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
      // Admin/impersonation helper functions (platform-level)
      getEffectiveUser,
      setImpersonation,
      clearImpersonation
    };

    // Execute the function
    const executionResult = await serverFunction(args);

    return {
      result: executionResult,
      graph: {
        edges: context.relationships!,
        vertexes: context.nodes!,
      },
    };
  } catch (error: any) {
    console.error(`Error executing named function '${request.functionName}':`, error, error.cause);

    // Error classification and message sanitization
    // Neo4j driver errors contain non-serializable objects (functions, circular refs)
    // We extract only serializable information for the API response
    let errorMessage = error.message || 'Unknown error';
    let errorType = 'ExecutionError';

    // Detect database connection errors and provide helpful messages
    // These patterns indicate Neo4j server is unavailable or unreachable
    if (errorMessage.includes('Could not perform discovery') ||
        errorMessage.includes('connect') ||
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('database') ||
        error.code === 'ServiceUnavailable') {
      errorType = 'DatabaseConnectionError';
      errorMessage = 'Unable to connect to the database. Please ensure the database is running and try again.';
    }

    // Return serializable error object
    // This prevents H3Error: "The value [object Function] cannot be parsed/serialized"
    return {
      error: `Failed to execute function '${request.functionName}': ${errorMessage}`,
      errorType
    };
  } finally {
    // CRITICAL: Session cleanup to prevent leaks
    // Only close sessions we created in this function
    // Sessions from parent context must not be closed here
    if (sessionCreatedLocally && dbSession) {
      await dbSession.close(); // Release connection back to pool
      delete context.dbSession; // Remove from context to prevent reuse
    }
  }
}