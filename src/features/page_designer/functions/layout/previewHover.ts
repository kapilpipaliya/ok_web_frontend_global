import type { SetStoreFunction } from "solid-js/store";

import type { PageLayoutObject } from "~/features/page_designer/context/LayoutContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { Id } from "~/lib/graph/type/id";

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

export function isLayoutPreviewHover(
  layout: PageLayoutObject | undefined,
  itemId: Id | number,
) {
  return !!layout && layout.previewHoverId === itemId;
}
