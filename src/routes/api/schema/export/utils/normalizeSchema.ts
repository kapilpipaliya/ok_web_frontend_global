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
  const stack = new Set<string>(); // for cycle detection

  function dfs(vertexId: string, path: string[]) {
    if (stack.has(vertexId)) {
      const cyclePath = [...path, vertexId].join(" -> ");
      throw new Error(`Cycle detected in schema: ${cyclePath}`);
    }
    if (visited.has(vertexId)) return;

    stack.add(vertexId);

    const vertex = vertexById.get(vertexId);
    if (!vertex) return;

    orderedIds.push(vertexId);

    // Sort children (Attr and PageLayout by displayOrder)
    let children = (childrenMap.get(vertexId) || []).sort((a, b) => {
      const va = vertexById.get(a);
      const vb = vertexById.get(b);

      if (va?.L === vb?.L && (va?.L === "Attr" || va?.L === "PageLayout")) {
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
  for (const rootId of rootVertexes) dfs(rootId, []);

  // Handle disconnected graph parts
  for (const v of schema.vertexes) {
    if (!visited.has(v.id)) dfs(v.id, []);
  }

  // Reorder vertices by DFS order
  const orderedVertices = orderedIds.map((id) => vertexById.get(id)!);

  // ===== NORMALIZATION =====
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

  // ------ NEW PART: Sort edges based on DFS vertex order ------
  // Edges are sorted by:
  // DFS order of source vertex (S)
  // If same source, then DFS order of target vertex (E)
  const vertexOrderIndex = new Map<string, number>();
  orderedIds.forEach((id, i) => vertexOrderIndex.set(id, i));

  const orderedEdges = [...schema.edges].sort((e1, e2) => {
    const s1 = vertexOrderIndex.get(e1.S) ?? Number.MAX_SAFE_INTEGER;
    const s2 = vertexOrderIndex.get(e2.S) ?? Number.MAX_SAFE_INTEGER;
    if (s1 !== s2) return s1 - s2;

    const t1 = vertexOrderIndex.get(e1.E) ?? Number.MAX_SAFE_INTEGER;
    const t2 = vertexOrderIndex.get(e2.E) ?? Number.MAX_SAFE_INTEGER;
    return t1 - t2;
  });

  // Normalize edges with new order
  let edgeCounter = 1;
  const normalizedEdges: ExportedEdge[] = orderedEdges.map((edge) => ({
    id: `e${edgeCounter++}`,
    T: edge.T,
    S: idMap.get(edge.S) || edge.S,
    E: idMap.get(edge.E) || edge.E,
    ...(edge.P ? { P: edge.P } : {}) as { P: Record<string, unknown> },
  }));

  return {
    vertexes: normalizedVertexes,
    edges: normalizedEdges,
  };
}
