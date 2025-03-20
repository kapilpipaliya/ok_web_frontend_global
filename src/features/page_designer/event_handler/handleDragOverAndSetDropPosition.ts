import type { Accessor } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { PageLayoutObject } from "~/features/page_designer/context/LayoutContext";
import type { Id, Vertex } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

import { getIndicatorPosition } from "~/features/page_designer/functions/drag_drop/getIndicatorPosition";
import { validateDragOver } from "~/features/page_designer/functions/drag_drop/validateDragOver";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";

export function handleDragOverAndSetDropPosition(
  e: DragEvent,
  layoutStoreVertex: Vertex<PageLayoutObject>,
  _formStoreVertex: Vertex<FormStoreObject>,
  layoutVertex: Vertex,
  isDesignMode: boolean | undefined,
  collapsedKeys: Accessor<Id[]> | boolean,
  children: Accessor<Vertex[]>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  formData: Vertex,
) {
  let position = getIndicatorPosition(e, e.currentTarget as HTMLElement) as
    | "after"
    | "before"
    | "center"
    | "left"
    | "right"
    | null;
  if (!position) {
    mergeVertexProperties<PageLayoutObject>(
      0,
      layoutStoreVertex.id!,
      graph,
      setGraph,
      { activeItem: null, position: null },
    );
    return;
  }

  let activeItem: Id;
  if (position === "before" || position === "left") {
    activeItem = layoutVertex.id;
  } else if (position === "after" || position === "right") {
    if (
      isDesignMode ||
      typeof collapsedKeys !== "function" ||
      collapsedKeys().includes(layoutVertex.id)
    ) {
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

  const fromVertex = graph.vertexes[layoutStoreVertex?.P.draggedVertexIds[0]];
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
    position = null;
  }

  if (
    layoutStoreVertex.P.activeItem !== activeItem ||
    layoutStoreVertex.P.position !== position
  ) {
    mergeVertexProperties<PageLayoutObject>(
      0,
      layoutStoreVertex.id!,
      graph,
      setGraph,
      { activeItem, position },
    );
  }
}
