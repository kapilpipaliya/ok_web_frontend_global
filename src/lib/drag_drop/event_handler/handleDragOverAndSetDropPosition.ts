import { type Accessor, Setter } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";
import { validateDragOver } from "~/lib/drag_drop/validateDragOver";
import { getIndicatorPosition } from "~/lib/drag_drop/getIndicatorPosition";
import { IIndicatorPosition } from "../../contexts";


export function handleDragOverAndSetDropPosition(e: DragEvent, setIndicatorPosition: Setter<IIndicatorPosition>, setDragOverTargetId: Setter<string | number>, layoutVertex: Vertex, isPreview: boolean | undefined, collapsedKeys: Accessor<Id[]>, children: () => Vertex[], draggedVertex: () => (Vertex[] | []), graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>, formData: Vertex) {
  let position = getIndicatorPosition(e, e.currentTarget as HTMLElement) as "before" |
    "after" |
    "center" |
    "left" |
    "right" |
    null;
  if (!position) {
    setIndicatorPosition({ activeItem: null, position: null });
    setDragOverTargetId(-1);
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

  const fromVertex = draggedVertex()[0];
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
  setIndicatorPosition({ activeItem, position });
  setDragOverTargetId(layoutVertex.id);
}
