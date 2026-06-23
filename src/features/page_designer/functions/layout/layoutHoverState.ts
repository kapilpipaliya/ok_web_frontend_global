import type { SetStoreFunction } from "solid-js/store";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { PageLayoutObject } from "~/features/page_designer/context/LayoutContext";
import { syncHighlightedCompKey } from "~/features/page_designer/functions/layout/syncHighlightedCompKey";
import { evalExpression } from "~/lib/expression_eval";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";

// Layout-tree drag hover: previewHoverId highlights the row under the pointer;
// hoverId drives parent-row highlight and the properties panel during drag.
// Center drop → hovered item is the parent container, so show its properties.
// Before/after drop → show the hovered item's parent (the sibling container).
export function getAttrParentVertex(
  graph: GraphInterface,
  vertex: Vertex,
): Vertex | undefined {
  const parents =
    (evalExpression("<-Attr", { graph, vertexes: [vertex] }) as
      | Vertex[]
      | undefined) ?? [];
  return parents[0];
}

export function getLayoutTreePropertiesAttrId(
  layoutStore: PageLayoutObject | undefined,
  layoutVertex: Vertex,
  graph: GraphInterface,
): Id | number | undefined {
  if (layoutStore?.activeItem == null || !layoutStore.dragPosition) {
    return undefined;
  }
  if (layoutStore.dragPosition === "center") {
    return layoutVertex.id;
  }
  return getAttrParentVertex(graph, layoutVertex)?.id;
}

export function syncLayoutTreeDragHover(
  layoutStoreVertex: Vertex<PageLayoutObject>,
  layoutVertex: Vertex,
  formStoreVertex: Vertex<FormStoreObject> | undefined,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const propertiesAttrId = getLayoutTreePropertiesAttrId(
    layoutStoreVertex.P,
    layoutVertex,
    graph,
  );
  const formId = formStoreVertex?.id;
  if (
    propertiesAttrId == null ||
    propertiesAttrId === -1 ||
    !formId ||
    formStoreVertex.P.hoverId === propertiesAttrId
  ) {
    return;
  }

  mergeVertexProperties<FormStoreObject>(0, formId, graph, setGraph, {
    hoverId: propertiesAttrId,
  });
  syncHighlightedCompKey(
    layoutStoreVertex.id,
    propertiesAttrId,
    graph,
    setGraph,
  );
}

export function getPropertiesAttrId(
  formStore: FormStoreObject | undefined,
  layoutStore: PageLayoutObject | undefined,
): Id | number {
  if (layoutStore?.activeItem != null && layoutStore.dragPosition) {
    if (layoutStore.dragPosition === "center") {
      return layoutStore.activeItem;
    }
    const hoverId = formStore?.hoverId ?? -1;
    if (hoverId !== -1) {
      return hoverId;
    }
  }
  return formStore?.selectedId ?? -1;
}
