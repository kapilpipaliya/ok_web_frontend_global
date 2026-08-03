import type { SetStoreFunction } from "solid-js/store";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type {
  LayoutTreeScrollSource,
  PageLayoutObject,
} from "~/features/page_designer/context/LayoutContext";
import { clearHighlightedCompKey } from "~/features/page_designer/functions/layout/syncHighlightedCompKey";
import { syncHighlightedCompKey } from "~/features/page_designer/functions/layout/syncHighlightedCompKey";
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
  scrollSource?: LayoutTreeScrollSource,
) {
  mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
    previewHoverId: hoverId,
    ...(scrollSource ? { layoutTreeScrollSource: scrollSource } : {}),
  });
  if (hoverId != null && hoverId !== -1) {
    syncHighlightedCompKey(layoutStoreId, hoverId, graph, setGraph);
  }
}

export function isLayoutTreeHoverActive(layout: PageLayoutObject | undefined) {
  return (
    !!layout &&
    layout.layoutTreeScrollSource === "layoutTree" &&
    layout.previewHoverId != null &&
    layout.previewHoverId !== -1
  );
}

export function clearLayoutPreviewHover(
  layoutStoreId: Id,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  options?: { clearScrollSource?: boolean },
) {
  mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
    previewHoverId: -1,
    ...(options?.clearScrollSource ? { layoutTreeScrollSource: null } : {}),
  });
}

export function schedulePreviewHoverClear(
  layoutStoreId: Id,
  formStoreId: Id,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const layout = graph.vertexes[layoutStoreId]?.P as
    | PageLayoutObject
    | undefined;
  if (isLayoutTreeHoverActive(layout)) {
    return;
  }

  // Debounced: avoids flicker when moving between nested preview wrappers.
  cancelPendingPreviewHoverClear();
  pendingPreviewHoverClearRaf = requestAnimationFrame(() => {
    pendingPreviewHoverClearRaf = null;
    const latestLayout = graph.vertexes[layoutStoreId]?.P as
      | PageLayoutObject
      | undefined;
    if (isLayoutTreeHoverActive(latestLayout)) {
      return;
    }
    mergeVertexProperties<FormStoreObject>(0, formStoreId, graph, setGraph, {
      hoverId: -1,
    });
    clearLayoutPreviewHover(layoutStoreId, graph, setGraph);
    clearHighlightedCompKey(layoutStoreId, graph, setGraph);
  });
}

export function isLayoutPreviewHover(
  layout: PageLayoutObject | undefined,
  itemId: Id | number,
) {
  return !!layout && layout.previewHoverId === itemId;
}
