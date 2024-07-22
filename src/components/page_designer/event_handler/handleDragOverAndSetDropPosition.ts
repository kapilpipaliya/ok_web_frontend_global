import type { Accessor } from "solid-js";
import type { SetStoreFunction, Store } from "solid-js/store";

import type { PageLayoutObject } from "~/components/page_designer/LayoutContext";
import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";

import { getIndicatorPosition } from "~/components/page_designer/functions/getIndicatorPosition";
import { validateDragOver } from "~/components/page_designer/functions/validateDragOver";

export function handleDragOverAndSetDropPosition(
  e: DragEvent,
  layoutStore: Store<PageLayoutObject>,
  setLayoutStore: SetStoreFunction<PageLayoutObject>,
  layoutVertex: Vertex,
  isPreview: boolean | undefined,
  collapsedKeys: Accessor<Id[]> | boolean,
  children: () => Vertex[],
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  formData: Vertex,
) {
  setLayoutStore({ activeItem: layoutVertex.id, position: null });
  let position = getIndicatorPosition(e, e.currentTarget as HTMLElement) as
    | "after"
    | "before"
    | "center"
    | "left"
    | "right"
    | null;
  if (!position) {
    setLayoutStore({ activeItem: null, position: null });
    return;
  }

  let activeItem: Id;
  if (position === "before" || position === "left") {
    activeItem = layoutVertex.id;
  } else if (position === "after" || position === "right") {
    if (isPreview || typeof collapsedKeys !== "function" || collapsedKeys().includes(layoutVertex.id)) {
      // collapsed state
      activeItem = layoutVertex.id;
    } else {
      // expanded State
      if (children().length) {
        activeItem = children()[0].id;
        position = "before";
      } else {
        activeItem = layoutVertex.id;
      }
    }
  } else {
    // drop over
    activeItem = layoutVertex.id;
  }

  const fromVertex = layoutStore.draggedVertices[0];
  const toVertexId = activeItem;
  if (
    !validateDragOver(
      graph,
      setGraph,
      fromVertex,
      toVertexId,
      formData,
      position,
    )
  ) {
    return;
  }
  setLayoutStore({ activeItem, position });
}
