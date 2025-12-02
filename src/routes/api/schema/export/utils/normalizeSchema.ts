import type {
  ExportedSchema,
  ExportedVertex,
  ExportedEdge,
} from "~/routes/api/schema/ExportedSchema";

export function normalizeSchema(schema: ExportedSchema): ExportedSchema {
  // Build adjacency lists
  const childrenMap = new Map<string, string[]>(); // parent -> children
  const incoming = new Set<string>(); // vertices that have a parent

  for (const edge of schema.edges) {
    if (!childrenMap.has(edge.S)) childrenMap.set(edge.S, []);
    childrenMap.get(edge.S)!.push(edge.E);
    incoming.add(edge.E);
  }

  // Identify root-level vertices (no incoming edges)
  const rootVertexes = schema.vertexes
    .filter((v) => !incoming.has(v.id))
    .map((v) => v.id);

  // Quick lookup for vertices
  const vertexById = new Map(schema.vertexes.map((v) => [v.id, v]));

  // DFS ordering variables
  const orderedIds: string[] = [];
  const visited = new Set<string>();
  const stack = new Set<string>(); // <---- for cycle detection

  function dfs(vertexId: string, path: string[]) {
    if (stack.has(vertexId)) {
      // Cycle detected → throw error with path
      const cyclePath = [...path, vertexId].join(" -> ");
      throw new Error(`Cycle detected in schema: ${cyclePath}`);
    }
    if (visited.has(vertexId)) return;

    stack.add(vertexId);

    const vertex = vertexById.get(vertexId);
    if (!vertex) return;

    orderedIds.push(vertexId);

    // Sort children (only Attr by displayOrder)
    let children = childrenMap.get(vertexId) || [];
    children = children.sort((a, b) => {
      const va = vertexById.get(a);
      const vb = vertexById.get(b);

      if (va?.L === "Attr" && vb?.L === "Attr") {
        const da = Number(va.P.displayOrder ?? Number.MAX_SAFE_INTEGER);
        const db = Number(vb.P.displayOrder ?? Number.MAX_SAFE_INTEGER);
        return da - db;
      }

      return 0; // no sorting for other vertex types
    });

    for (const childId of children) {
      dfs(childId, [...path, vertexId]);
    }

    stack.delete(vertexId);
    visited.add(vertexId);
  }

  // Traverse root vertices
  for (const rootId of rootVertexes) {
    dfs(rootId, []);
  }

  // In case of disconnected vertices or cycles handled as visited
  for (const v of schema.vertexes) {
    if (!visited.has(v.id)) dfs(v.id, []);
  }

  // Reorder vertices based on DFS order
  const orderedVertices = orderedIds.map((id) => vertexById.get(id)!);

  // ===== NORMALIZATION (your original logic) =====
  const idMap = new Map<string, string>();
  let idCounter = 1;

  orderedVertices.forEach((vertex) => {
    idMap.set(vertex.id, String(idCounter++));
  });

  const normalizedVertexes: ExportedVertex[] = orderedVertices.map((vertex) => ({
    id: idMap.get(vertex.id)!,
    L: vertex.L,
    P: vertex.P,
  }));

  let edgeCounter = 1;
  const normalizedEdges: ExportedEdge[] = schema.edges.map((edge) => ({
    id: `e${edgeCounter++}`,
    T: edge.T,
    S: idMap.get(edge.S) || edge.S,
    E: idMap.get(edge.E) || edge.E,
    ...(edge.P ? {P: edge.P} : {}) as {P: Record<string, unknown>},
  }));

  return {
    vertexes: normalizedVertexes,
    edges: normalizedEdges,
  };
}
