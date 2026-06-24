import type { SetStoreFunction } from "solid-js/store";

import { fetchAndSetGraphData } from "../../../lib/graph/mutate/data/fetchAndSetGraphData";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { Vertex } from "~/lib/graph/type/vertex";

/** Sentinel id for the virtual "Uncategorized" folder (files with no category). */
export const UNCATEGORIZED_ID = "__uncategorized__";

/** Virtual vertex for Uncategorized sidebar item (files with no category). Added on frontend only. */
export const UNCATEGORIZED_VERTEX: Vertex = {
  id: UNCATEGORIZED_ID,
  L: ["Folder"],
  P: { key: "Uncategorized" },
  IN: {},
  OUT: {},
} as Vertex;

export function getExpressionForFilesData(
  toParentEdgeType: string,
  folderId: string | string[],
) {
  const ids = Array.isArray(folderId) ? folderId.join(",") : folderId;
  return `id:'${ids}'<-${toParentEdgeType}`;
}

/** Returns true when the given folder id is the virtual Uncategorized folder. */
export function isUncategorizedId(folderId: string | string[]): boolean {
  if (Array.isArray(folderId)) {
    return folderId.length === 1 && folderId[0] === UNCATEGORIZED_ID;
  }
  return folderId === UNCATEGORIZED_ID;
}

/**
 * Fetch File vertices that have no outgoing edge of toParentEdgeType (e.g. ParentFolder).
 * Uses filter __noOutgoingEdge__ (see mongoToCypher), which produces NOT EXISTS { MATCH (n)-[:EdgeType]->() }.
 */
export async function getUncategorizedFilesData(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  toParentEdgeType: string,
) {
  return await fetchAndSetGraphData(graph, setGraph, `g:'File[$1]'`, {
    $1: { filter: { __noOutgoingEdge__: toParentEdgeType } },
    nodes: {},
    relationships: {},
  });
}

export async function getFilesData(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  toParentEdgeType: string,
  folderId: string | string[],
) {
  if (isUncategorizedId(folderId)) {
    return await getUncategorizedFilesData(graph, setGraph, toParentEdgeType);
  }
  const expression = getExpressionForFilesData(toParentEdgeType, folderId);
  return await fetchAndSetGraphData(graph, setGraph, expression);
}
