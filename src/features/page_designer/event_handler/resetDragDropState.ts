import type { SetStoreFunction } from "solid-js/store";

import { batch } from "solid-js";

import type { PageLayoutObject } from "~/features/page_designer/context/LayoutContext";
import type { Vertex } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";

export function resetDragDropState(
  layoutStoreVertex: Vertex<PageLayoutObject>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  batch(() => {
    mergeVertexProperties<PageLayoutObject>(
      0,
      layoutStoreVertex.id,
      graph,
      setGraph,
      {
        activeItem: null,
        draggedVertexIds: [],
        position: null,
      },
    );
  });
}
