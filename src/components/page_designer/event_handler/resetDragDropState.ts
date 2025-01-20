import type { SetStoreFunction } from "solid-js/store";

import { batch } from "solid-js";

import type { PageLayoutObject } from "~/components/page_designer/context/LayoutContext";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import { FormStoreObject } from "~/components/form/context/FormContext";

import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

export function resetDragDropState(
  layoutStoreVertex: Vertex<PageLayoutObject>,
  // we dont have accesss to the form store vertex here, remove this param
  formStoreVertex: Vertex<FormStoreObject>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  batch(() => {
    mergeVertexProperties<PageLayoutObject>(0, layoutStoreVertex.id, graph, setGraph, {
      draggedVertexIds: [],
    });
    // we dont have accesss to the form store vertex here
    // mergeVertexProperties<FormStoreObject>(0, formStoreVertex.id, graph, setGraph, {
    //   activeItem: null,
    //   position: null,
    // });
  });
}
