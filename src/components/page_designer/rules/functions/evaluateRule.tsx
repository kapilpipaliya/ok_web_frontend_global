import type { SetStoreFunction, Store } from "solid-js/store";

import jsep from "jsep";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { evaluate } from "~/lib/expression_eval";

import { getConditionsExpression } from "./getConditionsExpression";

export function evaluateRule(
  rule: Vertex,
  formVertex: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>
): boolean {
  const expr = getConditionsExpression(rule, formVertex, graph, setGraph);
  const parsedExpression = jsep(expr);
  return evaluate(parsedExpression, {
    graph,
    setGraph,
    vertexes: [formVertex],
  });
}
