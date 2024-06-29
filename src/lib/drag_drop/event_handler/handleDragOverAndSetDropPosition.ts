import type { Accessor, } from "solid-js";
import type { SetStoreFunction, Store } from "solid-js/store";
import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";
import { validateDragOver } from "~/lib/drag_drop/validateDragOver";
import { getIndicatorPosition } from "~/lib/drag_drop/getIndicatorPosition";
import type { PageLayoutObject } from "~/components/page_designer/LayoutContext";


export function handleDragOverAndSetDropPosition(e: DragEvent, layoutStore: Store<PageLayoutObject>, setLayoutStore: SetStoreFunction<PageLayoutObject>, layoutVertex: Vertex, isPreview: boolean | undefined, collapsedKeys: Accessor<Id[]>, children: () => Vertex[], graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>, formData: Vertex) {
  let position = getIndicatorPosition(e, e.currentTarget as HTMLElement) as "before" |
    "after" |
    "center" |
    "left" |
    "right" |
    null;
  if (!position) {
    setLayoutStore({ activeItem: null, position: null });
    setLayoutStore('dragOverTargetId', -1);
    return;
  }

  let activeItem: Id;
  if (position === "before" || position === "left") {
    activeItem = layoutVertex.id;
  } else if (position === "after" || position === "right") {
    if (isPreview || collapsedKeys().includes(layoutVertex.id)) {
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
  if (!validateDragOver(
    graph,
    setGraph,
    fromVertex,
    toVertexId,
    formData,
    position
  )) {
    return;
  }
  setLayoutStore({ activeItem, position });
  setLayoutStore('dragOverTargetId', layoutVertex.id);
}
