import type { Accessor } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";

import type { PageLayoutObject } from "~/components/page_designer/context/LayoutContext";
import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";
import { FormStoreObject } from "~/components/form/context/FormContext";

import { validateDragOver } from "~/components/page_designer/functions/validateDragOver";

import { handleDragOverAndSetDropPosition } from "./handleDragOverAndSetDropPosition";

export function handleDragOver(
  e: DragEvent,
  layoutStoreId: string,
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
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;

  handleDragOverAndSetDropPosition(
    e,
    layoutStoreId,
    layoutVertex,
    isDesignMode,
    collapsedKeys,
    children,
    graph,
    setGraph,
    formData,
  );

  if (!layoutStore().position) {
    // Don't allow drag and drop
    return;
  }
  expandChildren?.(layoutStore().position!);

  for (const vertexId of layoutStore().draggedVertexIds) {
    const fromVertex = graph.vertexes[vertexId];
    const toVertexId = layoutStore().activeItem!;
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
        layoutStore().position!,
      )
    ) {
      // Don't allow drag and drop
      return;
    }
  }

  // This is necessary to allow the drop action to proceed
  e.preventDefault();
}
