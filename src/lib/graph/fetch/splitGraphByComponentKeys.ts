import type { ServerResult } from "~/cypher/types/ServerResult";
import type { Edge } from "~/lib/graph/type/edge";
import type { Vertex } from "~/lib/graph/type/vertex";

/**
 * Split a multi-component fetch graph into one subgraph per Component key.
 * Walks all edges reachable from each Component root so Attr / variant trees
 * stay intact for per-component caching.
 */
export function splitGraphByComponentKeys(
  result: ServerResult | undefined,
  componentKeys: string[],
): Map<string, Pick<ServerResult, "graph">> {
  const out = new Map<string, Pick<ServerResult, "graph">>();
  const graph = result?.graph;
  if (!graph?.vertexes || componentKeys.length === 0) {
    return out;
  }

  const keySet = new Set(componentKeys);
  const rootsByKey = new Map<string, string>();

  for (const [id, vertex] of Object.entries(graph.vertexes)) {
    if (!vertex?.L?.includes("Component")) {
      continue;
    }
    const key = vertex.P?.key;
    if (typeof key === "string" && keySet.has(key) && !rootsByKey.has(key)) {
      rootsByKey.set(key, id);
    }
  }

  const edgesByStart = new Map<string, Edge[]>();
  for (const edge of Object.values(graph.edges || {})) {
    if (!edge?.S) {
      continue;
    }
    const list = edgesByStart.get(edge.S);
    if (list) {
      list.push(edge);
    } else {
      edgesByStart.set(edge.S, [edge]);
    }
  }

  for (const [componentKey, rootId] of rootsByKey) {
    const vertexIds = new Set<string>();
    const edgeIds = new Set<string>();
    const queue = [rootId];
    vertexIds.add(rootId);

    while (queue.length > 0) {
      const current = queue.pop()!;
      const outgoing = edgesByStart.get(current);
      if (!outgoing) {
        continue;
      }
      for (const edge of outgoing) {
        edgeIds.add(edge.id);
        if (edge.E && !vertexIds.has(edge.E)) {
          vertexIds.add(edge.E);
          queue.push(edge.E);
        }
      }
    }

    const vertexes: Record<string, Vertex> = {};
    const edges: Record<string, Edge> = {};
    for (const id of vertexIds) {
      const vertex = graph.vertexes[id];
      if (vertex) {
        vertexes[id] = vertex;
      }
    }
    for (const id of edgeIds) {
      const edge = graph.edges?.[id];
      if (edge) {
        edges[id] = edge;
      }
    }

    out.set(componentKey, { graph: { vertexes, edges } });
  }

  return out;
}
