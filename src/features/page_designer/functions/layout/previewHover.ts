import type { SetStoreFunction } from "solid-js/store";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { PageLayoutObject } from "~/features/page_designer/context/LayoutContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { Id } from "~/lib/graph/type/id";

let pendingPreviewHoverClearRaf: number | null = null;

export function cancelPendingPreviewHoverClear() {
  if (pendingPreviewHoverClearRaf != null) {
    cancelAnimationFrame(pendingPreviewHoverClearRaf);
    pendingPreviewHoverClearRaf = null;
  }
}

export function setLayoutPreviewHover(
  layoutStoreId: Id,
  hoverId: Id | number,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
    previewHoverId: hoverId,
  });
}

export function clearLayoutPreviewHover(
  layoutStoreId: Id,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
    previewHoverId: -1,
  });
}

export function schedulePreviewHoverClear(
  layoutStoreId: Id,
  formStoreId: Id,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  // Debounced: avoids flicker when moving between nested preview wrappers.
  cancelPendingPreviewHoverClear();
  pendingPreviewHoverClearRaf = requestAnimationFrame(() => {
    pendingPreviewHoverClearRaf = null;
    mergeVertexProperties<FormStoreObject>(0, formStoreId, graph, setGraph, {
      hoverId: -1,
    });
    clearLayoutPreviewHover(layoutStoreId, graph, setGraph);
  });
}

export function isLayoutPreviewHover(
  layout: PageLayoutObject | undefined,
  itemId: Id | number,
) {
  return !!layout && layout.previewHoverId === itemId;
}
