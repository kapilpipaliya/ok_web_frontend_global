import type { Accessor } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";

import type { PageLayoutObject } from "~/components/page_designer/context/LayoutContext";
import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";
import { FormStoreObject } from "~/components/form/FormContext";

import { getIndicatorPosition } from "~/components/page_designer/functions/getIndicatorPosition";
import { validateDragOver } from "~/components/page_designer/functions/validateDragOver";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

export function handleDragOverAndSetDropPosition(
  e: DragEvent,
  layoutStoreId: string,
  layoutVertex: Vertex,
  isDesignMode: boolean | undefined,
  collapsedKeys: Accessor<Id[]> | boolean,
  children: Accessor<Vertex[]>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  formData: Vertex,
) {
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, { activeItem: layoutVertex.id, position: null });
  let position = getIndicatorPosition(e, e.currentTarget as HTMLElement) as
    | "after"
    | "before"
    | "center"
    | "left"
    | "right"
    | null;
  if (!position) {
    mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, { activeItem: null, position: null });
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

  const fromVertex = graph.vertexes[layoutStore().draggedVertexIds[0]];
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
  mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, { activeItem, position });
}
