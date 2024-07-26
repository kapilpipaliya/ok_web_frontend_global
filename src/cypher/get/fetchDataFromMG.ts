import jsep from "jsep";

import type { ServerResult } from "~/cypher/types/ServerResult";

import { evalAsync } from "~/lib/expression_eval";
import { Vertex } from "~/lib/graph/graph";

import type { NestedExpression } from "./NestedExpression";

import { ContextType } from "../types/ContextType";

export async function fetchDataFromMG(
  expression: NestedExpression,
  context: ContextType,
): Promise<ServerResult> {
  "use server";
  const mainResult = await evalAsync(jsep(expression.expression), context);
  
  await processIncomingOutgoingExpressions(expression, mainResult, context);

  return {
    graph: {
      edges: context.relationships!,
      vertexes: context.nodes!,
    },
    result: mainResult,
  };
}

async function processIncomingOutgoingExpressions(
  expression: NestedExpression,
  mainResult: Vertex[],
  context: ContextType
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