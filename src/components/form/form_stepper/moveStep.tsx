import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { sortChildren } from "~/components/page_designer/functions/sortChildren";

import type { PageLayoutObject } from "../../page_designer/context/LayoutContext";

export function moveStep(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  layoutStore: Store<PageLayoutObject>,
  _setLayoutStore: SetStoreFunction<PageLayoutObject>,
  steps: Vertex[],
  fromIndex: number,
  toIndex: number,
) {
  const fromVertex = steps[fromIndex];
  const toVertex = steps[toIndex];
  const position = toIndex < fromIndex ? "before" : "after";
  sortChildren(
    graph,
    setGraph,
    layoutStore.formStore[0].txnId,
    fromVertex,
    layoutStore.formStore[0].formData,
    toVertex,
    position,
  );
}
