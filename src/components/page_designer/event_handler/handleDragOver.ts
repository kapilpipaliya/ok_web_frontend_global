import type { Accessor, } from "solid-js";
import type { SetStoreFunction, Store } from "solid-js/store";
import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";
import { validateDragOver } from "~/lib/drag_drop/validateDragOver";
import { handleDragOverAndSetDropPosition } from "./handleDragOverAndSetDropPosition";
import type { PageLayoutObject } from "~/components/page_designer/LayoutContext";

export function handleDragOver(e: DragEvent, layoutStore: Store<PageLayoutObject>, setLayoutStore: SetStoreFunction<PageLayoutObject>, layoutVertex: Vertex, isPreview: undefined | boolean, collapsedKeys: (() => Id[]), children: Accessor<Vertex[]>, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>, formData: Vertex) {
  e.stopPropagation();
  handleDragOverAndSetDropPosition(e, layoutStore, setLayoutStore, layoutVertex, isPreview, collapsedKeys, children, graph, setGraph, formData);

  if (!layoutStore.position) {
    // Don't allow drag and drop
    return;
  }

  for (const vertex of layoutStore.draggedVertices) {
    const fromVertex = vertex;
    const toVertexId = layoutStore.activeItem!;
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
      layoutStore.position
    )) {
      // Don't allow drag and drop
      return;
    }
  }

  // This is necessary to allow the drop action to proceed
  e.preventDefault();
}
