import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { addStepComponentAttr } from "~/lib/drag_drop/drop/addStepComponentAttr";
import { sortChildren } from "~/lib/drag_drop/sortChildren";

import type { PageLayoutObject } from "../../LayoutContext";

export function addStepBefore(graph: Store<GraphInterface>, setGraph: SetStoreFunction<GraphInterface>, layoutStore: Store<PageLayoutObject>, setLayoutStore: SetStoreFunction<PageLayoutObject>, toVertex: Vertex) {
  const layoutRowId = addStepComponentAttr(layoutStore.formData.formData, layoutStore.formData.txnId, graph, setGraph);

  if (layoutRowId === -1) return;

  const fromVertex = graph.vertexes[layoutRowId];

  sortChildren(
    graph,
    setGraph,
    layoutStore.formData.txnId,
    fromVertex,
    layoutStore.formData.formData,
    toVertex,
    "before"
  );

  setLayoutStore('activeStepId', layoutRowId);
}
