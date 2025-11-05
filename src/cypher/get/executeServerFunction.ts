import type { Session } from "neo4j-driver";
import type { ServerResult } from "~/cypher/types/ServerResult";
import type { EvalExpressionContext } from "../types/EvalExpressionContext";
import { getDBSessionForSubdomain } from "../session/getSessionForSubdomain";
import type { Edge } from "~/lib/graph/type/edge";
import type { Vertex } from "~/lib/graph/type/vertex";
import {executeNamedServerFunction} from "~/cypher/get/executeNamedServerFunction";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";
import { convertNodeToJson, neo4jConvert } from "../conversion/convertNodeToJson";

interface ServerFunctionRequest {
  functionBody: string;
  contextData?: any;
}

/**
 * Execute server-side function from provided function body string
 *
 * Similar to executeNamedServerFunction, but accepts the function body directly
 * instead of looking it up in the database.
 *
 * Session Management:
 * - Reuses session from context if available
 * - Creates new session if needed and closes it in finally block
 * - Prevents session leaks by tracking ownership
 *
 * @param request - Function body string and context data
 * @param context - Execution context with optional existing session
 * @returns ServerResult with function execution result or error
 */
export async function executeServerFunction(
  request: ServerFunctionRequest,
  context: EvalExpressionContext & {
    [key: `$${string}`]: any;
  } = {
    nodes: {} as { [key: string]: Vertex },
    relationships: {} as { [key: string]: Edge },
    vertexes: undefined as any,
  },
): Promise<ServerResult> {
  "use server";

  // Session lifecycle tracking
  let dbSession: Session;
  let sessionCreatedLocally = false;

  if (context.dbSession) {
    // Reuse existing session from context
    dbSession = context.dbSession;
  } else {
    // Create new session - will be closed in finally block
    ({ dbSession } = await getDBSessionForSubdomain());
    sessionCreatedLocally = true;
    context.dbSession = dbSession;
  }

  try {
    // Create the function from the provided body string
    // The function has access to args object with session, context, and contextData
    const AsyncFunction = Object.getPrototypeOf(
      async function () {},
    ).constructor;
    const serverFunction = new AsyncFunction("args", request.functionBody);

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
      neo4jConvert,
      graph: {
        nodes: context.nodes,
        relationships: context.relationships,
      },
    };

    // Execute the function
    const result = await serverFunction(args);

    return {
      result,
      graph: {
        edges: context.relationships!,
        vertexes: context.nodes!,
      },
    };
  } catch (error: any) {
    console.error("Error in executeServerFunction:", error, error.cause);
    // Return serializable error message only
    return { error: error.message };
  } finally {
    // CRITICAL: Session cleanup to prevent leaks
    // Only close sessions we created (sessionCreatedLocally = true)
    // Never close sessions from parent context
    if (sessionCreatedLocally && dbSession) {
      await dbSession.close(); // Release connection back to pool
      delete context.dbSession; // Remove from context to prevent reuse
    }
  }
}
