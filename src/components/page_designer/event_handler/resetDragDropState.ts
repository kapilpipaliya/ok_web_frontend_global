import type { SetStoreFunction } from "solid-js/store";

import { batch } from "solid-js";

import type { PageLayoutObject } from "~/components/page_designer/context/LayoutContext";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import { FormStoreObject } from "~/components/form/context/FormContext";

import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

export function resetDragDropState(
  formStoreVertex: Vertex<FormStoreObject>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  batch(() => {
    mergeVertexProperties<FormStoreObject>(0, formStoreVertex.id, graph, setGraph, {
      activeItem: null,
      draggedVertexIds: [],
      position: null,
    });
  });
}
