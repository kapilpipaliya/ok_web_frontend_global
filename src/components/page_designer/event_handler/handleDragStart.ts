import type { SetStoreFunction, Store } from "solid-js/store";
import { FormStoreObject } from "~/components/form/context/FormContext";

import type { PageLayoutObject } from "~/components/page_designer/context/LayoutContext";
import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

export function handleDragStart(
  e: DragEvent,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  layoutStoreVertex: Vertex<PageLayoutObject>,
  layoutVertex: Vertex,
) {
  e.stopPropagation();

  mergeVertexProperties<PageLayoutObject>(0, layoutStoreVertex.id, graph, setGraph, {
    draggedVertexIds: [...(layoutStoreVertex?.P.draggedVertexIds || []), layoutVertex.id],
  });
}
