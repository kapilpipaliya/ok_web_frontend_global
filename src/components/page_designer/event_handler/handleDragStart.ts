import type { SetStoreFunction } from "solid-js/store";

import type { PageLayoutObject } from "~/components/page_designer/LayoutContext";
import type { Vertex } from "~/lib/graph/graph";

export function handleDragStart(
  e: DragEvent,
  setLayoutStore: SetStoreFunction<PageLayoutObject>,
  layoutVertex: Vertex,
) {
  e.stopPropagation();
  setLayoutStore("draggedVertices", (prev) => [...prev, layoutVertex]);
}
