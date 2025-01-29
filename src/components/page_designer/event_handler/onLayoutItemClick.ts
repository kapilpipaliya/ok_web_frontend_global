import type { SetStoreFunction } from "solid-js/store";

import { batch } from "solid-js";

import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";
import { FormStoreObject } from "~/components/form/context/FormContext";

import { getComponentFromLayoutRow } from "~/components/page_designer/functions/drop/getComponentFromLayoutRow";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import { PageLayoutObject } from "../context/LayoutContext";

export function onLayoutItemClick(
  layoutStoreVertex: Vertex<PageLayoutObject>,
  formStoreVertex: Vertex<FormStoreObject>,
  layoutVertexId: Id,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  batch(() => {
    if (layoutStoreVertex.P.formId !== formStoreVertex.id) {
      mergeVertexProperties<PageLayoutObject>(0, layoutStoreVertex.id, graph, setGraph, {
        formId: formStoreVertex.id,
      });
    }
    mergeVertexProperties<FormStoreObject>(0, formStoreVertex.id, graph, setGraph, {
      selectedId: layoutVertexId ?? -1,
    });
  });
}
