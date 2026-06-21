import type { SetStoreFunction } from "solid-js/store";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { PageLayoutObject } from "~/features/page_designer/context/LayoutContext";
import { PageDesignerLabels } from "~/features/page_designer/constants/PageDesignerLabels";
import type { LayoutDropSnapshot } from "~/features/page_designer/functions/drag_drop/pragmatic/dropPositionState";
import { handleDropAtPosition } from "~/features/page_designer/functions/drag_drop/core/handleDropAtPosition";
import { loadPageData } from "~/features/page_designer/functions/fetch/loadPageData";
import { onLayoutItemClick } from "~/features/page_designer/event_handler/onLayoutItemClick";

import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export async function executeLayoutDrop(
  layoutStoreVertex: Vertex<PageLayoutObject>,
  formStoreVertex: Vertex<FormStoreObject>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  showErrorToast: (message: string) => void,
  snapshot?: LayoutDropSnapshot | null,
) {
  const activeItem = snapshot?.activeItem ?? layoutStoreVertex.P.activeItem;
  const dragPosition =
    snapshot?.dragPosition ?? layoutStoreVertex.P.dragPosition;
  const vertexIds = snapshot?.vertexIds ?? [];

  if (activeItem == null) {
    showErrorToast("Active item not found when dropping");
    return;
  }

  if (vertexIds.length === 0) {
    showErrorToast("Dragged item not found when dropping");
    return;
  }

  const toVertex = graph.vertexes[activeItem];
  if (!toVertex) {
    showErrorToast("Target vertex not found when dropping");
    return;
  }

  for (const vertexId of vertexIds) {
    const fromVertex = graph.vertexes[vertexId];

    if (!fromVertex) {
      showErrorToast("from Vertex not found when dropping ");
      return;
    }

    if (!dragPosition) {
      showErrorToast("Position not found when dropping");
      return;
    }

    if (PageDesignerLabels.includes(fromVertex.L[0])) {
      await loadPageData(graph, setGraph, fromVertex, showErrorToast);
    }

    const layoutId = await handleDropAtPosition(
      graph,
      setGraph,
      formStoreVertex?.P.txnId,
      graph.vertexes[formStoreVertex.P.formDataId!],
      fromVertex,
      toVertex,
      dragPosition,
    );

    if (
      (layoutId !== -1 && fromVertex.L[0] === "Comp") ||
      fromVertex.L[0] === "Component"
    ) {
      onLayoutItemClick(
        layoutStoreVertex,
        formStoreVertex,
        layoutId as string,
        graph,
        setGraph,
      );
    }
  }
}
