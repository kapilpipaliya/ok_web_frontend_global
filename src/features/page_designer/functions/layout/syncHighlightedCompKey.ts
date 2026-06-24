import type { SetStoreFunction } from "solid-js/store";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { PageLayoutObject } from "~/features/page_designer/context/LayoutContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { Id } from "~/lib/graph/type/id";

export function getCompKeyFromAttrId(
  graph: GraphInterface,
  attrId: Id | number,
): string | null {
  if (attrId == null || attrId === -1) return null;
  const vertex = graph.vertexes[attrId];
  if (!vertex) return null;
  const componentName = vertex.P?.componentName as string | undefined;
  if (componentName) return componentName;
  const key = vertex.P?.key as string | undefined;
  return key ?? null;
}

export function syncHighlightedCompKey(
  layoutStoreId: Id,
  attrId: Id | number,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const compKey = getCompKeyFromAttrId(graph, attrId);
  mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
    highlightedCompKey: compKey,
  });
}

export function clearHighlightedCompKey(
  layoutStoreId: Id,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
    highlightedCompKey: null,
  });
}

export function syncHighlightedCompFromFormStore(
  layoutStoreId: Id,
  formStoreVertex: { P: FormStoreObject } | undefined,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (!formStoreVertex) return;
  const hoverId = formStoreVertex.P.hoverId;
  const selectedId = formStoreVertex.P.selectedId;
  const attrId = hoverId != null && hoverId !== -1 ? hoverId : selectedId;
  if (attrId == null || attrId === -1) {
    clearHighlightedCompKey(layoutStoreId, graph, setGraph);
    return;
  }
  syncHighlightedCompKey(layoutStoreId, attrId, graph, setGraph);
}
