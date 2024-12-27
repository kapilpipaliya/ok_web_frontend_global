import type { SetStoreFunction, Store } from "solid-js/store";

import type { PageLayoutObject } from "~/components/page_designer/context/LayoutContext";
import type { GraphInterface } from "~/lib/graph/graph";

import { handleDropAtPosition } from "~/components/page_designer/functions/handleDropAtPosition";
import { loadPageData } from "~/components/page_designer/functions/loadPageData";

import { PageDesignerLabels } from "../functions/PageDesignerLabels";
import { onLayoutItemClick } from "./onLayoutItemClick";

export async function handleDrop(
  e: DragEvent,
  layoutStore: Store<PageLayoutObject>,
  setLayoutStore: SetStoreFunction<PageLayoutObject>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  showErrorToast: (message: string) => void,
) {
  e.stopPropagation();
  if (!layoutStore.activeItem) { // layoutVertex
    showErrorToast("Active item not found when dropping");
    return;
  }
  const toVertex = graph.vertexes[layoutStore.activeItem];
  if (!toVertex) {
    showErrorToast("Target vertex not found when dropping");
    return;
  }

  for (const vertex of layoutStore.draggedVertices) {
    const fromVertex = vertex;

    if (!fromVertex) {
      showErrorToast("from Vertex not found when dropping ");
      return;
    }

    if (PageDesignerLabels.includes(fromVertex.L[0])) {
      await loadPageData(graph, setGraph, fromVertex, showErrorToast);
    }

    if (!layoutStore.position) {
      showErrorToast("Position not found when dropping");
      return;
    }
    // NOTE: Multiple selected dragged vertexes may not drop before or after as expected. test it.
    const layoutId = await handleDropAtPosition(
      graph,
      setGraph,
      layoutStore.formStore[0].txnId,
      layoutStore.formStore[0].formData,
      fromVertex,
      toVertex,
      layoutStore.position,
    );
    if (layoutId !== -1 && fromVertex.L[0] === "Comp") {
      onLayoutItemClick(setLayoutStore, layoutId as string, graph, setGraph);
    }
  }
}
