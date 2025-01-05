import type { SetStoreFunction } from "solid-js/store";

import type { PageLayoutObject } from "~/components/page_designer/context/LayoutContext";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import { FormStoreObject } from "~/components/form/FormContext";

import { handleDropAtPosition } from "~/components/page_designer/functions/handleDropAtPosition";
import { loadPageData } from "~/components/page_designer/functions/loadPageData";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

import { PageDesignerLabels } from "../functions/PageDesignerLabels";

export async function handleDrop(
  e: DragEvent,
  layoutStoreId: string,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  showErrorToast: (message: string) => void,
) {
  e.stopPropagation();
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  if (!layoutStore().activeItem) { // layoutVertex
    showErrorToast("Active item not found when dropping");
    return;
  }
  const toVertex = graph.vertexes[layoutStore().activeItem!];
  if (!toVertex) {
    showErrorToast("Target vertex not found when dropping");
    return;
  }

  for (const vertexId of layoutStore().draggedVertexIds) {
    const fromVertex = graph.vertexes[vertexId];

    if (!fromVertex) {
      showErrorToast("from Vertex not found when dropping ");
      return;
    }

    if (PageDesignerLabels.includes(fromVertex.L[0])) {
      await loadPageData(graph, setGraph, fromVertex, showErrorToast);
    }

    if (!layoutStore().position) {
      showErrorToast("Position not found when dropping");
      return;
    }
    // NOTE: Multiple selected dragged vertexes may not drop before or after as expected. test it.
    const layoutId = await handleDropAtPosition(
      graph,
      setGraph,
      formStoreVertex().P.txnId,
      graph.vertexes[formStoreVertex().P.formDataId!],
      fromVertex,
      toVertex,
      layoutStore().position!,
    );
    if (layoutId !== -1 && fromVertex.L[0] === "Comp") {
      mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
        selectedId: layoutId as string,
        selectedComponent: -1
      });
    }
  }
}
