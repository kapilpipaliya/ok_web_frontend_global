import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export interface PaletteDragContext {
  graph: GraphInterface;
  vertexId: Id;
  getSelectedVertices?: () => Vertex[];
  clearSelectedVertices?: () => void;
}

export function getPaletteDragVertices(ctx: PaletteDragContext) {
  if (ctx.getSelectedVertices && ctx.getSelectedVertices().length > 0) {
    return ctx.getSelectedVertices();
  }

  const vertex = ctx.graph.vertexes[ctx.vertexId];
  return vertex ? [vertex] : [];
}

export function getVertexIdsFromSourceData(
  data: Record<string, unknown>,
): Id[] {
  if (Array.isArray(data.vertexIds)) {
    return data.vertexIds.filter((id): id is Id => id != null);
  }

  if (data.vertexId != null) {
    return [data.vertexId as Id];
  }

  return [];
}
