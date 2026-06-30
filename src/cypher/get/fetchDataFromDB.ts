import type { Session } from "neo4j-driver";

import type { ServerResult } from "~/cypher/types/ServerResult";

import { evalExpressionAsync } from "~/lib/expression_eval";

import type { EvalExpressionContext } from "../types/EvalExpressionContext";
import type { NestedExpression } from "../types/NestedExpression";

import { getDBSessionForSubdomain } from "../session/getSessionForSubdomain";
import type { Edge } from "~/lib/graph/type/edge";
import type { Vertex } from "~/lib/graph/type/vertex";

/**
 * Fetch data from Neo4j database using expressions
 *
 * This function executes Cypher queries via expressions and manages database sessions.
 *
 * CRITICAL SESSION MANAGEMENT:
 * - Sessions MUST be closed after use to prevent leaks
 * - Uses try/finally to ensure cleanup even on errors
 * - Tracks whether session was created locally vs reused from context
 * - Only closes sessions that were created in this function
 *
 * Session leak symptoms:
 * - Neo4j becomes unresponsive after some time
 * - Connection pool exhaustion errors
 * - Increasing memory usage over time
 *
 * @param expression - Cypher expression to evaluate
 * @param context - Execution context with nodes, relationships, and optional existing session
 * @param _permissionCheck - Whether to check permissions (currently disabled)
 * @returns ServerResult with graph data and query results
 */
export async function fetchDataFromDB(
  expression: NestedExpression,
  context: EvalExpressionContext & { adminui?: boolean } & {
    [key: `$${string}`]: any;
  } = {
    nodes: {} as { [key: string]: Vertex },
    relationships: {} as { [key: string]: Edge },
    vertexes: undefined as any,
  },
  _permissionCheck = true,
): Promise<ServerResult> {
  "use server";

  // Session lifecycle tracking
  // IMPORTANT: Session must be explicitly closed to prevent leaks
  let dbSession: Session | undefined;
  let sessionCreatedLocally = false; // Track if we created the session (and must close it)

  // @ts-expect-error ignore
  if (expression.adminui) {
    context.adminui = true;
  }

  try {
    // Session acquisition strategy:
    // 1. Reuse existing session from context if available (for nested calls)
    // 2. Create new session if needed (and mark for cleanup)
    if (context.dbSession) {
      // Reuse session from parent context
      // Do NOT close this session - parent context owns it
      dbSession = context.dbSession;
    } else {
      // Create new session for this operation
      // MUST close this session in finally block
      ({ dbSession } = await getDBSessionForSubdomain(
        context.adminui
          ? ({ url: "http://localhost/?adminui=true" } as Request)
          : undefined,
      ));
      sessionCreatedLocally = true; // Flag: we own this session and must close it
      context.dbSession = dbSession; // Share with nested calls
    }

    // if (permissionCheck) {
    //   const authorizationError = await checkAdminUserAuthorization(
    //     subDomain,
    //     dbSession,
    //   );
    //   if (authorizationError) {
    //     return authorizationError;
    //   }
    // }

    // Execute the main expression query
    const mainResult = await evalExpressionAsync(
      expression.expression,
      context,
    );

    // Fetch related nodes/edges in parallel where safe (see processIncomingOutgoingExpressions)
    await processIncomingOutgoingExpressions(expression, mainResult, context);

    return {
      graph: {
        edges: context.relationships!,
        vertexes: context.nodes!,
      },
      result: mainResult,
    };
  } catch (error: any) {
    console.error(
      "Error in fetchDataFromDB:",
      expression.expression,
      error,
      error.cause,
    );
    return { error: error.message };
  } finally {
    // CRITICAL: Session cleanup to prevent leaks
    // Only close sessions we created (sessionCreatedLocally = true)
    // Never close sessions from parent context (would break nested operations)
    if (sessionCreatedLocally && dbSession) {
      await dbSession.close(); // Release connection back to pool
      delete context.dbSession; // Remove from context to prevent reuse after close
    }
  }
}

type FetchDataContext = EvalExpressionContext & { adminui?: boolean } & {
  [key: `$${string}`]: any;
};

/**
 * Fetches related graph data for all incoming/outgoing expressions on the main result.
 *
 * Incoming and outgoing expressions at the same level are independent (they all start
 * from the same mainResult vertices), so they are fetched in parallel for performance.
 * Deeper nesting is handled recursively inside each fetchDataFromDB call.
 */
async function processIncomingOutgoingExpressions(
  expression: NestedExpression,
  mainResult: Vertex[],
  context: FetchDataContext,
) {
  if (!mainResult?.length) {
    return;
  }

  // Combine sibling expressions so incoming + outgoing can run concurrently.
  const expressions = [
    ...(expression.incoming ?? []),
    ...(expression.outgoing ?? []),
  ];

  if (expressions.length === 0) {
    return;
  }

  // All nested expressions read from the same parent vertices.
  const vertexes = [...mainResult];

  // Transactions must stay sequential — Neo4j does not support concurrent tx.run().
  if (context.tx) {
    for (const exp of expressions) {
      context.vertexes = vertexes;
      await fetchDataFromDB(exp, context);
    }
    return;
  }

  // Each branch gets its own session (dbSession: undefined) so queries can run in
  // parallel without sharing one session. nodes/relationships stay shared so results
  // merge into the same graph on the parent context.
  await Promise.all(
    expressions.map((exp) =>
      fetchDataFromDB(exp, {
        ...context,
        vertexes,
        dbSession: undefined,
      } as FetchDataContext),
    ),
  );
}
