import type { SetStoreFunction, Store } from "solid-js/store";

import type { PageLayoutObject } from "~/components/page_designer/context/LayoutContext";
import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

export function handleDragStart(
  e: DragEvent,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  layoutStoreId: Id,
  layoutVertex: Vertex,
) {
  e.stopPropagation();

  const layoutStore = graph.vertexes[layoutStoreId].P as Partial<PageLayoutObject>;

  mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
    draggedVertices: [...(layoutStore.draggedVertices || []), layoutVertex],
  });
}
