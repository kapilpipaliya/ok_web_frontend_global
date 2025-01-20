import type { Accessor } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";

import type { PageLayoutObject } from "~/components/page_designer/context/LayoutContext";
import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";
import { FormStoreObject } from "~/components/form/context/FormContext";

import { validateDragOver } from "~/components/page_designer/functions/validateDragOver";

import { handleDragOverAndSetDropPosition } from "./handleDragOverAndSetDropPosition";

export function handleDragOver(
  e: DragEvent,
  layoutStoreVertex: Vertex<PageLayoutObject>,
  formStoreVertex: Vertex<FormStoreObject>,
  layoutVertex: Vertex,
  isDesignMode: boolean | undefined,
  collapsedKeys: Accessor<Id[]> | boolean,
  children: Accessor<Vertex[]>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  formData: Vertex,
  expandChildren?: (position: string) => void,
) {
  e.stopPropagation();

  handleDragOverAndSetDropPosition(
    e,
    layoutStoreVertex,
    formStoreVertex,
    layoutVertex,
    isDesignMode,
    collapsedKeys,
    children,
    graph,
    setGraph,
    formData,
  );

  if (!formStoreVertex?.P.position) {
    // Don't allow drag and drop
    return;
  }
  expandChildren?.(formStoreVertex?.P.position!);

  for (const vertexId of layoutStoreVertex?.P.draggedVertexIds) {
    const fromVertex = graph.vertexes[vertexId];
    const toVertexId = formStoreVertex?.P.activeItem!;
    if (!fromVertex) {
      // Don't allow drag and drop
      return;
    }

    if (
      !validateDragOver(
        graph,
        setGraph,
        fromVertex,
        toVertexId,
        formData,
        formStoreVertex?.P.position!,
      )
    ) {
      // Don't allow drag and drop
      return;
    }
  }

  // This is necessary to allow the drop action to proceed
  e.preventDefault();
}
