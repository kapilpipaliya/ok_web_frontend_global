import type { SetStoreFunction } from "solid-js/store";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type {
  LayoutTreeScrollSource,
  PageLayoutObject,
} from "~/features/page_designer/context/LayoutContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { Id } from "~/lib/graph/type/id";

import {
  cancelPendingPreviewHoverClear,
  clearLayoutPreviewHover,
  isLayoutTreeHoverActive,
  setLayoutPreviewHover,
} from "./previewHover";

export type DesignerHoverSource = LayoutTreeScrollSource;

export function setDesignerHover(
  formStoreId: Id,
  layoutStoreId: Id,
  itemId: Id | number,
  source: DesignerHoverSource,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  cancelPendingPreviewHoverClear();
  mergeVertexProperties<FormStoreObject>(0, formStoreId, graph, setGraph, {
    hoverId: itemId,
  });
  setLayoutPreviewHover(layoutStoreId, itemId, graph, setGraph, source);
}

export function clearDesignerHoverFromPreview(
  formStoreId: Id,
  layoutStoreId: Id,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const layout = graph.vertexes[layoutStoreId]?.P as PageLayoutObject | undefined;
  if (isLayoutTreeHoverActive(layout)) {
    return;
  }
  mergeVertexProperties<FormStoreObject>(0, formStoreId, graph, setGraph, {
    hoverId: -1,
  });
  clearLayoutPreviewHover(layoutStoreId, graph, setGraph);
}

export function clearDesignerHoverFromLayoutTree(
  formStoreId: Id,
  layoutStoreId: Id,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  mergeVertexProperties<FormStoreObject>(0, formStoreId, graph, setGraph, {
    hoverId: -1,
  });
  clearLayoutPreviewHover(layoutStoreId, graph, setGraph, {
    clearScrollSource: true,
  });
}
