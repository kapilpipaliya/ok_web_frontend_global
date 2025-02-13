import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { evalExpression } from "~/lib/expression_eval";
import { sortVertexesByPosition } from "~/lib/graph/get/sync/sortVertexesByPosition";

export function getChildrenAttrs(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  child: Vertex,
): Vertex[] {
  if (!child) {
    return [];
  }
  return sortVertexesByPosition(
    evalExpression("->Attr", { graph, setGraph, vertexes: [child] }) || [],
  );
}
