import type { SetStoreFunction } from "solid-js/store";

import type { PageLayoutObject } from "~/features/page_designer/context/LayoutContext";
import { clearDropPosition } from "~/features/page_designer/functions/drag_drop/pragmatic/setDropPositionFromPointer";

import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export interface LayoutDropSnapshot {
  activeItem: Id;
  dragPosition: NonNullable<PageLayoutObject["dragPosition"]>;
  vertexIds: Id[];
}

let pendingDropClearRaf: number | null = null;

export function cancelPendingDropPositionClear() {
  if (pendingDropClearRaf != null) {
    cancelAnimationFrame(pendingDropClearRaf);
    pendingDropClearRaf = null;
  }
}

export function scheduleDropPositionClear(
  layoutStoreVertex: Vertex<PageLayoutObject>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  cancelPendingDropPositionClear();
  pendingDropClearRaf = requestAnimationFrame(() => {
    pendingDropClearRaf = null;
    clearDropPosition(layoutStoreVertex, graph, setGraph);
  });
}

export function createLayoutDropSnapshot(
  layoutStoreVertex: Vertex<PageLayoutObject>,
  vertexIds: Id[],
): LayoutDropSnapshot | null {
  const { activeItem, dragPosition } = layoutStoreVertex.P;
  if (activeItem == null || !dragPosition || vertexIds.length === 0) {
    return null;
  }

  return {
    activeItem,
    dragPosition,
    vertexIds: [...vertexIds],
  };
}
