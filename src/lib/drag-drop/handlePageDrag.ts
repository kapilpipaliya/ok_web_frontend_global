import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import type { SetStoreFunction } from "solid-js/store";
import { componentDrag } from "~/lib/drag-drop/componentDrag";
import { sortChildren } from "~/lib/drag-drop/sortChildren";

export async function handlePageDrag(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  fromVertex: Vertex,
  toVertex: Vertex,
  toParentVertex: Vertex | undefined,
  formData: Vertex,
  position: string,
) {
  const layoutRowId = componentDrag(
    txnId,
    fromVertex,
    toParentVertex || formData,
    graph,
    setGraph,
  );
  if (layoutRowId === -1) return;

  fromVertex = graph.vertexes[layoutRowId];

  sortChildren(
    graph,
    setGraph,
    txnId,
    fromVertex,
    toParentVertex!,
    toVertex,
    position,
  );
}
