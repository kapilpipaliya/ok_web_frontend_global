import type { SetStoreFunction } from "solid-js/store";

import { batch } from "solid-js";

import type { PageLayoutObject } from "~/components/page_designer/context/LayoutContext";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import { FormStoreObject } from "~/components/form/context/FormContext";

import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

export function resetDragDropState(
  layoutStoreId: string,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  batch(() => {
    mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
      activeItem: null,
      draggedVertexIds: [],
      position: null,
    });
  });
}
