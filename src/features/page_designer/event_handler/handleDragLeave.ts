import type { SetStoreFunction, Store } from "solid-js/store";

import type { PageLayoutObject } from "~/features/page_designer/context/LayoutContext";
import type { GraphInterface } from "~/lib/graph/GraphContext";

import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";

export function handleDragLeave(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  layoutStoreId: string,
) {
  mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
    activeItem: null,
    dragPosition: null,
  });
  // Do not uncomment this, because drag is called before on drop
  // setDraggedVertex(null);
  // resetDragDropState();
}
