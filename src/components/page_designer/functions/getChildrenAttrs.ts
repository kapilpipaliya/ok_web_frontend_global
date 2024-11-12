import type { Store, SetStoreFunction } from "solid-js/store";
import { evalExpression } from "~/lib/expression_eval";
import { sortVertexesByPosition } from "~/lib/graph/get/sync/sortVertexesByPosition";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";


export function getChildrenAttrs(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  child: Vertex
): Vertex[] {
  if (!child) {
    return [];
  }
  return sortVertexesByPosition(
    evalExpression("->Attr", { graph, setGraph, vertexes: [child] }) || []
  );
}
