import type { SetStoreFunction, Store } from "solid-js/store";

import jsep from "jsep";

import type {
  GraphInterface,
  Vertex
} from "~/lib/graph/graph";

import { evaluate } from "~/lib/expression_eval";
import { replaceExpressionToLabel } from "~/lib/graph/get/sync/replaceExpressionToLabel";


export function getSelectionOptions(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  collection: string,
  vertexes: Vertex[],
  strict?: boolean
): { error: boolean; vertexes?: any; } {
  collection = replaceExpressionToLabel(graph, setGraph, collection, vertexes[0]);
  try {
    const value = evaluate(jsep(collection), {
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
