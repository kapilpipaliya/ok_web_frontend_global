import type { ServerResult } from "~/cypher/types/ServerResult";
import { stripVertexAdjacency } from "~/lib/graph/transfer/stripVertexAdjacency";

export function stripGraphTimestamps(graph?: ServerResult["graph"]) {
  if (!graph) {
    return;
  }

  for (const vertex of Object.values(graph.vertexes || {})) {
    delete vertex.P.createdAt;
    delete vertex.P.updatedAt;
  }

  for (const edge of Object.values(graph.edges || {})) {
    delete edge.P.createdAt;
    delete edge.P.updatedAt;
    if (Object.keys(edge.P).length === 0) {
      delete (edge as { P?: typeof edge.P }).P;
    }
  }
}

export function mergeGraphs(
  results: ServerResult[],
): ServerResult | undefined {
  if (results.length === 0) {
    return undefined;
  }

  if (results.length === 1) {
    const { graph } = results[0];
    if (!graph) {
      return undefined;
    }
    stripVertexAdjacency(graph);
    return { graph };
  }

  const merged: ServerResult = {
    graph: { vertexes: {}, edges: {} },
  };

  for (const result of results) {
    if (result.graph?.vertexes) {
      Object.assign(merged.graph!.vertexes, result.graph.vertexes);
    }
    if (result.graph?.edges) {
      Object.assign(merged.graph!.edges, result.graph.edges);
    }
  }

  stripVertexAdjacency(merged.graph);
  return merged;
}
