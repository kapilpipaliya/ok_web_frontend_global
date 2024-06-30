import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import { sortChildren } from "~/lib/drag_drop/sortChildren";
import type { PageLayoutObject } from "../../LayoutContext";
import type { SetStoreFunction, Store } from "solid-js/store";

export function moveStep(graph: Store<GraphInterface>, setGraph: SetStoreFunction<GraphInterface>, layoutStore: Store<PageLayoutObject>, setLayoutStore: SetStoreFunction<PageLayoutObject>, steps: Vertex[], fromIndex: number, toIndex: number) {
  const fromVertex = steps[fromIndex];
  const toVertex = steps[toIndex];
  const position = toIndex < fromIndex ? "before" : "after";
  sortChildren(
    graph,
    setGraph,
    layoutStore.formData.txnId,
    fromVertex,
    layoutStore.formData.formData,
    toVertex,
    position
  );
}
