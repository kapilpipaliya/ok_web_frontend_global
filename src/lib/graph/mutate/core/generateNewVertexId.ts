import type { SetStoreFunction } from "solid-js/store";

import type { GraphInterface } from "~/lib/graph/GraphContext";

import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";

export function generateNewVertexId(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
): string {
  const globalStoreId = "globalStoreId";
  const newVertexId = graph.vertexes[globalStoreId].P.newVertexId_ + 1;

  mergeVertexProperties(0, globalStoreId, graph, setGraph, {
    newVertexId_: newVertexId,
  });

  return newVertexId.toString();
}
