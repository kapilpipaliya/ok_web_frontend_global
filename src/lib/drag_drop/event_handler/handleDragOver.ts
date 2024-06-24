import { type Accessor, Setter } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";
import { validateDragOver } from "~/lib/drag_drop/validateDragOver";
import { IIndicatorPosition } from "../../contexts";
import { handleDragOverAndSetDropPosition } from "./handleDragOverAndSetDropPosition";


export function handleDragOver(e: DragEvent, setIndicatorPosition: Setter<IIndicatorPosition>, setDragOverTargetId: Setter<string | number>, layoutVertex: Vertex, isPreview: undefined | boolean, collapsedKeys: (() => Id[]), draggedVertex: () => (Vertex[] | []), children: Accessor<Vertex[]>, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>, formData: Vertex, indicatorPosition: Accessor<IIndicatorPosition>) {
  e.stopPropagation();
  handleDragOverAndSetDropPosition(e, setIndicatorPosition, setDragOverTargetId, layoutVertex, isPreview, collapsedKeys, children, draggedVertex, graph, setGraph, formData);


  const position = indicatorPosition().position;
  if (!position) {
    // Don't allow drag and drop
    return;
  }

  for (const vertex of draggedVertex()) {
    const fromVertex = vertex;
    const toVertexId = indicatorPosition().activeItem!;
    if (!fromVertex) {
      // Don't allow drag and drop
      return;
    }

    if (!validateDragOver(
      graph,
      setGraph,
      fromVertex,
      toVertexId,
      formData,
      position
    )) {
      // Don't allow drag and drop
      return;
    }
  }

  // This is necessary to allow the drop action to proceed
  e.preventDefault();
}
