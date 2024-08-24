import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { evalExpression, } from "~/lib/expression_eval";

import { evaluateRule } from "./evaluateRule";

export function evaluateAttributeRules(
  attribute: Vertex,
  formVertex: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  conditionType: string,
): boolean {
  const rules =
    evalExpression(`->$0${conditionType}`, {
      graph,
      setGraph,
      vertexes: [attribute],
    }) ?? [];

  for (const rule of rules) {
    try {
      const result = evaluateRule(rule, formVertex, graph, setGraph);
      if (result) {
        return result;
      }
    } catch (_e) {}
  }
  return false;
}
