

import type { ServerResult } from "~/cypher/types/ServerResult";
import type { Vertex } from "~/lib/graph/graph";

import { evalExpressionAsync } from "~/lib/expression_eval";
import { checkSuperUserAuthorization } from "~/server/checkSuperUserAuthorization";

import type { ContextType } from "../types/ContextType";
import type { NestedExpression } from "../types/NestedExpression";

import { getDBSessionForSubdomain } from "./getSessionForSubdomain";

export async function fetchDataFromMG(
  expression: NestedExpression,
  context: ContextType = {
    nodes: {} as { [key: string]: any },
    relationships: {} as { [key: string]: any },
    vertexes: undefined as any,
  },
): Promise<ServerResult> {
  "use server";
  const { dbSession, subDomain } = await getDBSessionForSubdomain();

  const authorizationError = await checkSuperUserAuthorization(subDomain, dbSession);
  if (authorizationError) {
    return authorizationError;
  }
  try {
    const mainResult = await evalExpressionAsync(expression.expression, context);

    await processIncomingOutgoingExpressions(expression, mainResult, context);

    return {
      graph: {
        edges: context.relationships!,
        vertexes: context.nodes!,
      },
      result: mainResult,
    };
  } catch (error: any) {
    console.error("Error in fetchDataFromMG:", expression.expression, error);
    return { error: error.message };
  }
}

async function processIncomingOutgoingExpressions(
  expression: NestedExpression,
  mainResult: Vertex[],
  context: ContextType,
) {
  if (expression.incoming && mainResult && mainResult.length > 0) {
    for (const exp of expression.incoming) {
      context.vertexes = [...mainResult];
      await fetchDataFromMG(exp, context);
    }
  }
  if (expression.outgoing && mainResult && mainResult.length > 0) {
    for (const exp of expression.outgoing) {
      context.vertexes = [...mainResult];
      await fetchDataFromMG(exp, context);
    }
  }
}
