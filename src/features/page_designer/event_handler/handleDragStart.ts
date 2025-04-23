import type { SetStoreFunction, Store } from "solid-js/store";

import type { PageLayoutObject } from "~/features/page_designer/context/LayoutContext";
import type { Vertex } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";

export function handleDragStart(
  e: DragEvent,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  layoutStoreVertex: Vertex<PageLayoutObject>,
  layoutVertex: Vertex,
) {
  e.stopPropagation();

  mergeVertexProperties<PageLayoutObject>(
    0,
    layoutStoreVertex.id,
    graph,
    setGraph,
    {
      draggedVertexIds: [
        // ...(layoutStoreVertex?.P.draggedVertexIds || []),
        layoutVertex.id,
      ],
    },
  );
}
