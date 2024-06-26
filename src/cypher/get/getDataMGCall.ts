import {evalAsync} from "~/lib/expression_eval";
import jsep from "jsep";
import type { NestedExpression } from "./NestedExpression";

export async function getDataMGCall(
  expression: NestedExpression,
  context = {
    nodes: {} as { [key: string]: any },
    relationships: {} as { [key: string]: any },
    vertexes: undefined as any,
  },
) {
  "use server";
  const mainResult = await evalAsync(jsep(expression.expression), context);

  if (expression.incoming && mainResult && mainResult.length > 0) {
    for (const exp of expression.incoming) {
      context.vertexes = [...mainResult];
      await getDataMGCall(exp, context);
    }
  }
  if (expression.outgoing && mainResult && mainResult.length > 0) {
    for (const exp of expression.outgoing) {
      context.vertexes = [...mainResult];
      await getDataMGCall(exp, context);
    }
  }

  return {
    result: mainResult,
    graph: {
      vertexes: context.nodes,
      edges: context.relationships,
    },
  };
}