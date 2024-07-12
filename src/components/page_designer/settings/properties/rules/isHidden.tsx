import type { SetStoreFunction, Store } from "solid-js/store";

import jsep from "jsep";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { evaluate } from "~/lib/expression_eval";

import { getConditionsExpression } from "./getConditionsExpression";

export function isHidden(attr: Vertex, formVertex: Vertex, graph: Store<GraphInterface>, setGraph: SetStoreFunction<GraphInterface>) {
  const hiddenRules = evaluate(jsep("->$0Hidden"), {
    graph,
    setGraph,
    vertexes: [attr],
  }) ?? [];
  for (const rule of hiddenRules) {
    try {
      const expr = getConditionsExpression(rule, formVertex, graph, setGraph);
      const parsedExpression = jsep(expr);
      const result = evaluate(parsedExpression, {
        graph,
        setGraph,
        vertexes: [formVertex],
      });
      if (result) {
        return result;
      }
    } catch (e: any) {
      continue;
    }
  }
  return false;
}

export function isDisabled(attr: Vertex, formVertex: Vertex, graph: Store<GraphInterface>, setGraph: SetStoreFunction<GraphInterface>) {
  const disabledRules = evaluate(jsep("->$0Disabled"), {
    graph,
    setGraph,
    vertexes: [attr],
  }) ?? [];
  for (const rule of disabledRules) {
    try {
      const expr = getConditionsExpression(rule, formVertex, graph, setGraph);
      const parsedExpression = jsep(expr);
      const result = evaluate(parsedExpression, {
        graph,
        setGraph,
        vertexes: [formVertex],
      });
      if (result) {
        return result;
      }
    } catch (e: any) {
      continue;
    }
  }
  return false;
}
