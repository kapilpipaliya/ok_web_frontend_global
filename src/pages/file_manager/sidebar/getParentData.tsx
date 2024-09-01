import type { SetStoreFunction } from "solid-js/store";

import type { GraphInterface } from "~/lib/graph/graph";

import { fetchAndSetGraphData } from "~/lib/graph/mutate/fetchAndSetGraphData";

function getExpressionForParentData(
  toParentEdgeType: string,
  folderId?: string,
  fileId?: string,
) {
  // -> operator not return current vertex
  return `id:'${folderId || fileId}'->'${toParentEdgeType}*'`;
}

export async function getParentData(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  toParentEdgeType: string,
  folderId?: string,
  fileId?: string,
) {
  const expression = getExpressionForParentData(
    toParentEdgeType,
    folderId,
    fileId,
  );
  if (!expression) {
    return { error: "Invalid expression" };
  }

  return await fetchAndSetGraphData(graph, setGraph, expression, {});
}
