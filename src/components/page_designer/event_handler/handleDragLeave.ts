import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import type { PageLayoutObject } from "~/components/page_designer/context/LayoutContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import { FormStoreObject } from "~/components/form/context/FormContext";

export function handleDragLeave(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  layoutStoreId: string,
) {

  mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, { activeItem: null, position: null });
  // Do not uncomment this, because drag is called before on drop
  // setDraggedVertex(null);
  // resetDragDropState();
}
