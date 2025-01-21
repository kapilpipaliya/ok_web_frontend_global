import type { SetStoreFunction } from "solid-js/store";

import { batch } from "solid-js";

import type { PageLayoutObject } from "~/components/page_designer/context/LayoutContext";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

export function resetDragDropState(
  layoutStoreVertex: Vertex<PageLayoutObject>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  batch(() => {
    mergeVertexProperties<PageLayoutObject>(0, layoutStoreVertex.id, graph, setGraph, {
      draggedVertexIds: [],
      activeItem: null,
      position: null,
    });
  });
}
