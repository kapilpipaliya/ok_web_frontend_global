import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { evalExpression, } from "~/lib/expression_eval";

import { getConditionsExpression } from "./getConditionsExpression";

export function evaluateRule(
  rule: Vertex,
  formVertex: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
): boolean {
  const expr = getConditionsExpression(rule, formVertex, graph, setGraph);
  return evalExpression(expr, {
    graph,
    setGraph,
    vertexes: [formVertex],
  });
}
