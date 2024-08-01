import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { addComponentAttrInPage } from "~/components/page_designer/functions/drop/addComponentAttrInForm";
import { sortChildren } from "~/components/page_designer/functions/sortChildren";

import type { PageLayoutObject } from "../../page_designer/LayoutContext";

export function addStepBefore(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  layoutStore: Store<PageLayoutObject>,
  setLayoutStore: SetStoreFunction<PageLayoutObject>,
  formVertex: Vertex,
  toVertex: Vertex,
) {
  const layoutRowId = addComponentAttrInPage(
    formVertex,
    layoutStore.formStore.formData,
    layoutStore.formStore.txnId,
    graph,
    setGraph,
    "Step"
  );

  if (layoutRowId === -1) return;

  const fromVertex = graph.vertexes[layoutRowId];

  sortChildren(
    graph,
    setGraph,
    layoutStore.formStore.txnId,
    fromVertex,
    layoutStore.formStore.formData,
    toVertex,
    "before",
  );

  // setLayoutStore('activeStepId', layoutRowId);
}
