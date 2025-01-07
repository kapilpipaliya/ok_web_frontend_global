import type { SetStoreFunction } from "solid-js/store";

import { batch } from "solid-js";

import type { PageLayoutObject } from "~/components/page_designer/context/LayoutContext";
import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";
import { FormStoreObject } from "~/components/form/context/FormContext";

import { getComponentFromLayoutRow } from "~/components/page_designer/functions/drop/getComponentFromLayoutRow";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

export function onLayoutItemClick(
  layoutStoreId: string,
  layoutVertexId: Id,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  batch(() => {
    mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
      selectedId: layoutVertexId ?? -1
    });

    const componentVertex = getComponentFromLayoutRow(
      layoutVertexId,
      graph,
      setGraph,
    );
    mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
      selectedComponent: componentVertex?.id ?? -1
    });
  });
}
