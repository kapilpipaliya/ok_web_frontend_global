import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

/** Collect Component vertex keys already loaded into the client graph. */
export function getKnownComponentKeysFromGraph(
  graph: GraphInterface,
): string[] {
  const keys = new Set<string>();
  for (const vertex of Object.values(graph.vertexes)) {
    if (!vertex?.L?.includes("Component")) {
      continue;
    }
    const key = vertex.P?.key;
    if (typeof key === "string" && key.length > 0) {
      keys.add(key);
    }
  }
  return Array.from(keys).sort();
}
