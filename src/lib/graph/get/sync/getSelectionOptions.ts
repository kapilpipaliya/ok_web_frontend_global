import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { evalExpression } from "~/lib/expression_eval";

/* deprecated */
export function getSelectionOptions(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  collection: string,
  vertexes: Vertex[],
  _strict?: boolean,
): { error: boolean; vertexes?: any } {
  try {
    const value = evalExpression(collection, {
      graph,
      setGraph,
      vertexes: vertexes,
    });
    if (value) {
      return { error: false, vertexes: value };
    }
    return { error: true };
  } catch (e) {
    console.error(e, vertexes, collection);
    return { error: true };
  }
}
