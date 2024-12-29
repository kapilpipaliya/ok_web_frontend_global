import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { addComponentAttrInPage } from "~/components/page_designer/functions/drop/addComponentAttrInForm";
import { sortChildren } from "~/components/page_designer/functions/sortChildren";

import type { PageLayoutObject } from "../../page_designer/context/LayoutContext";

export function addStepAfter(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  layoutStore: Store<PageLayoutObject>,
  _setLayoutStore: SetStoreFunction<PageLayoutObject>,
  formVertex: Vertex,
  toVertex: Vertex,
) {
  const layoutRowId = addComponentAttrInPage(
    formVertex,
    graph.vertexes[layoutStore.formStore[0].formDataId!],
    layoutStore.formStore[0].txnId,
    graph,
    setGraph,
    "Step",
  );

  if (layoutRowId === -1) {
    return;
  }

  const fromVertex = graph.vertexes[layoutRowId];

  sortChildren(
    graph,
    setGraph,
    layoutStore.formStore[0].txnId,
    fromVertex,
    graph.vertexes[layoutStore.formStore[0].formDataId!],
    toVertex,
    "after",
  );

  // setLayoutStore('activeStepId', layoutRowId);
}
