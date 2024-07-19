import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { addComponentAttrInPage } from "~/components/page_designer/functions/drop/addComponentAttrInForm";
import { sortChildren } from "~/components/page_designer/functions/sortChildren";

import type { PageLayoutObject } from "../../page_designer/LayoutContext";

export function addStepAfter(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  layoutStore: Store<PageLayoutObject>,
  setLayoutStore: SetStoreFunction<PageLayoutObject>,
  toVertex: Vertex,
) {
  const layoutRowId = addComponentAttrInPage(
    layoutStore.formData.formData,
    layoutStore.formData.txnId,
    graph,
    setGraph,
    "Step"
  );

  if (layoutRowId === -1) return;

  const fromVertex = graph.vertexes[layoutRowId];

  sortChildren(
    graph,
    setGraph,
    layoutStore.formData.txnId,
    fromVertex,
    layoutStore.formData.formData,
    toVertex,
    "after",
  );

  // setLayoutStore('activeStepId', layoutRowId);
}
