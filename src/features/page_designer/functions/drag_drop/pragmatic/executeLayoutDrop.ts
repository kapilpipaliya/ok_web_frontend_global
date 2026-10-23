import type { StoreSetter as SetStoreFunction } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { PageLayoutObject } from "~/features/page_designer/context/LayoutContext";
import { PageDesignerLabels } from "~/features/page_designer/constants/PageDesignerLabels";
import type { LayoutDropSnapshot } from "~/features/page_designer/functions/drag_drop/pragmatic/dropPositionState";
import { handleDropAtPosition } from "~/features/page_designer/functions/drag_drop/core/handleDropAtPosition";
import { loadPageData } from "~/features/page_designer/functions/fetch/loadPageData";
import { onLayoutItemClick } from "~/features/page_designer/event_handler/onLayoutItemClick";
import {
  filterTopmostSelectionIds,
  sortLayoutIdsByTreeOrder,
} from "~/features/page_designer/functions/layout/layoutSelection";
import { saveUndoPoint } from "~/lib/graph/transaction/steps/saveUndoPoint";

import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

function isAfterPosition(position: string) {
  return position === "after" || position === "right";
}

function isBeforePosition(position: string) {
  return position === "before" || position === "left";
}

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
  const rawVertexIds = snapshot?.vertexIds ?? [];

  if (activeItem == null) {
    showErrorToast("Active item not found when dropping");
    return;
  }

  if (rawVertexIds.length === 0) {
    showErrorToast("Dragged item not found when dropping");
    return;
  }

  const toVertex = graph.vertexes[activeItem];
  if (!toVertex) {
    showErrorToast("Target vertex not found when dropping");
    return;
  }

  if (!dragPosition) {
    showErrorToast("Position not found when dropping");
    return;
  }

  // Topmost + tree order → contiguous block that keeps relative order.
  // before/left: reverse so the first selected ends closest to the target.
  // after/right: forward, chaining each item after the previous.
  const vertexIds = sortLayoutIdsByTreeOrder(
    filterTopmostSelectionIds(rawVertexIds, graph),
    graph,
    setGraph,
    formStoreVertex?.P.formDataId,
  );

  const orderedIds = isBeforePosition(dragPosition)
    ? [...vertexIds].reverse()
    : vertexIds;

  const isMulti = orderedIds.length > 1;
  const txnId = formStoreVertex?.P.txnId;
  let relativeTo = toVertex;
  let lastCreatedLayoutId: Id | number | undefined;

  for (const vertexId of orderedIds) {
    const fromVertex = graph.vertexes[vertexId];
    if (!fromVertex) {
      showErrorToast("from Vertex not found when dropping ");
      return;
    }

    if (PageDesignerLabels.includes(fromVertex.L[0])) {
      await loadPageData(graph, setGraph, fromVertex, showErrorToast);
    }

    const layoutId = await handleDropAtPosition(
      graph,
      setGraph,
      txnId,
      graph.vertexes[formStoreVertex.P.formDataId!],
      fromVertex,
      relativeTo,
      dragPosition,
      { skipUndo: isMulti },
    );

    if (isAfterPosition(dragPosition)) {
      relativeTo = graph.vertexes[vertexId] ?? fromVertex;
    }

    if (
      (layoutId !== -1 && fromVertex.L[0] === "Comp") ||
      fromVertex.L[0] === "Component"
    ) {
      lastCreatedLayoutId = layoutId as string;
    }
  }

  if (isMulti && txnId != null) {
    saveUndoPoint(txnId, graph, setGraph);
  }

  if (lastCreatedLayoutId != null && lastCreatedLayoutId !== -1) {
    onLayoutItemClick(
      layoutStoreVertex,
      formStoreVertex,
      lastCreatedLayoutId as string,
      graph,
      setGraph,
    );
  }
}
