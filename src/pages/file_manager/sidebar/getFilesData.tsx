import type { SetStoreFunction } from "solid-js/store";

import type { GraphInterface } from "~/lib/graph/graph";

import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";

export function getExpressionForFilesData(toParentEdgeType: string, folderId: string | string[]) {
  const ids = Array.isArray(folderId) ? folderId.join(",") : folderId;
  return `id:'${ids}'<-${toParentEdgeType}`;
}

export function getExpressionForRootData(toParentEdgeType: string, parentVertexLabel: string, folderId?: string, fileId?: string) {
  if (folderId || fileId) {
    // -> operator not return current vertex
    return `id:'${folderId || fileId}'->${toParentEdgeType}*`;
  } else {
    return `g:'${parentVertexLabel}[root]'`;
  }
}

export async function getFilesData(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  toParentEdgeType: string,
  folderId: string | string[],
) {
  const expression = getExpressionForFilesData(toParentEdgeType, folderId);
  return await fetchAndSetGraphData(graph, setGraph, expression);
}

export async function getRootData(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  toParentEdgeType: string,
  parentVertexLabel: string,
  folderId?: string,
  fileId?: string,
) {
  const expression = getExpressionForRootData(toParentEdgeType, parentVertexLabel, folderId, fileId);
  if (!expression) {
    return { error: "Invalid expression" };
  }

  return await fetchAndSetGraphData(graph, setGraph, expression);
}

async function fetchAndSetGraphData(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  expression: string
) {
  const result = await fetchDataFromMG({ expression });

  if (!isValidResponse(result)) {
    // @ts-expect-error ignore
    return { error: result.error || "Error When Loading Data" };
  }
  setGraphData(graph, setGraph, result.graph);

  return result;
}