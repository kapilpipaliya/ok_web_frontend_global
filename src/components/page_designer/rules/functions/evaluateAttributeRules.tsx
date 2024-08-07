import type { SetStoreFunction, Store } from "solid-js/store";

import jsep from "jsep";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { evaluate } from "~/lib/expression_eval";

import { evaluateRule } from "./evaluateRule";

export function evaluateAttributeRules(
  attribute: Vertex,
  formVertex: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  conditionType: string,
): boolean {
  const rules =
    evaluate(jsep(`->$0${conditionType}`), {
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
