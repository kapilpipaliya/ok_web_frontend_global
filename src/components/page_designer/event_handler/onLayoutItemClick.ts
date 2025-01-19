import type { SetStoreFunction } from "solid-js/store";

import { batch } from "solid-js";

import type { PageLayoutObject } from "~/components/page_designer/context/LayoutContext";
import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";
import { FormStoreObject } from "~/components/form/context/FormContext";

import { getComponentFromLayoutRow } from "~/components/page_designer/functions/drop/getComponentFromLayoutRow";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

export function onLayoutItemClick(
  formStoreVertex: Vertex<FormStoreObject>,
  layoutVertexId: Id,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  batch(() => {
    mergeVertexProperties<FormStoreObject>(0, formStoreVertex.id, graph, setGraph, {
      selectedId: layoutVertexId ?? -1
    });

    const componentVertex = getComponentFromLayoutRow(
      layoutVertexId,
      graph,
      setGraph,
    );
    mergeVertexProperties<FormStoreObject>(0, formStoreVertex.id, graph, setGraph, {
      selectedComponent: componentVertex?.id ?? -1
    });
  });
}
