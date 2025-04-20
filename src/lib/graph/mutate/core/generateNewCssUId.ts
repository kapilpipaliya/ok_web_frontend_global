import type { SetStoreFunction } from "solid-js/store";
import type { GraphInterface } from "../../GraphContext";
import { mergeVertexProperties } from "./vertex";

export function generateNewCssUId(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
): number {
  const globalStoreId = "globalStoreId";
  const newCssUId = graph.vertexes[globalStoreId].P.cssUId + 1;

  mergeVertexProperties(0, globalStoreId, graph, setGraph, {
    cssUId: newCssUId,
  });

  return newCssUId;
}
