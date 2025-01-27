import type { SetStoreFunction } from "solid-js/store";

import type { PageLayoutObject } from "~/components/page_designer/context/LayoutContext";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import { FormStoreObject } from "~/components/form/context/FormContext";

import { handleDropAtPosition } from "~/components/page_designer/functions/handleDropAtPosition";
import { loadPageData } from "~/components/page_designer/functions/loadPageData";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

import { PageDesignerLabels } from "../functions/PageDesignerLabels";
import { onLayoutItemClick } from "./onLayoutItemClick";

export async function handleDrop(
  e: DragEvent,
  layoutStoreVertex: Vertex<PageLayoutObject>,
  formStoreVertex: Vertex<FormStoreObject>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  showErrorToast: (message: string) => void,
) {
  e.stopPropagation();

  if (!layoutStoreVertex?.P.activeItem) { // layoutVertex
    showErrorToast("Active item not found when dropping");
    return;
  }
  const toVertex = graph.vertexes[layoutStoreVertex?.P.activeItem!];
  if (!toVertex) {
    showErrorToast("Target vertex not found when dropping");
    return;
  }

  for (const vertexId of layoutStoreVertex?.P.draggedVertexIds) {
    const fromVertex = graph.vertexes[vertexId];

    if (!fromVertex) {
      showErrorToast("from Vertex not found when dropping ");
      return;
    }

    if (PageDesignerLabels.includes(fromVertex.L[0])) {
      await loadPageData(graph, setGraph, fromVertex, showErrorToast);
    }

    if (!layoutStoreVertex?.P.position) {
      showErrorToast("Position not found when dropping");
      return;
    }
    // NOTE: Multiple selected dragged vertexes may not drop before or after as expected. test it.
    const layoutId = await handleDropAtPosition(
      graph,
      setGraph,
      formStoreVertex?.P.txnId,
      graph.vertexes[formStoreVertex?.P.formDataId!],
      fromVertex,
      toVertex,
      layoutStoreVertex?.P.position!,
    );
    if (layoutId !== -1 && fromVertex.L[0] === "Comp") {
      onLayoutItemClick(formStoreVertex, layoutId as string, graph, setGraph);
    }
  }
}
