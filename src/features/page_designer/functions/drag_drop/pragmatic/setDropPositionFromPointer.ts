import type { Accessor } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { PageLayoutObject } from "~/features/page_designer/context/LayoutContext";
import { validateDragOver } from "~/features/page_designer/functions/drag_drop/core/validateDragOver";
import { getIndicatorPosition } from "~/features/page_designer/functions/drag_drop/ui/getIndicatorPosition";

import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export interface PointerPosition {
  clientX: number;
  clientY: number;
}

export function setDropPositionFromPointer(
  pointer: PointerPosition,
  element: HTMLElement,
  layoutStoreVertex: Vertex<PageLayoutObject>,
  layoutVertex: Vertex,
  isDesignMode: boolean | undefined,
  collapsedKeys: Accessor<Id[]> | boolean,
  children: Accessor<Vertex[]>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  formData: Vertex | null,
  fromVertexId: Id | undefined,
) {
  let dragPosition = getIndicatorPosition(
    pointer as unknown as MouseEvent,
    element,
  ) as "after" | "before" | "center" | "left" | "right" | null;

  if (!dragPosition) {
    mergeVertexProperties<PageLayoutObject>(
      0,
      layoutStoreVertex.id!,
      graph,
      setGraph,
      { activeItem: null, dragPosition: null },
    );
    return;
  }

  let activeItem: Id;
  if (dragPosition === "before" || dragPosition === "left") {
    activeItem = layoutVertex.id;
  } else if (dragPosition === "after" || dragPosition === "right") {
    if (
      isDesignMode ||
      typeof collapsedKeys !== "function" ||
      collapsedKeys().includes(layoutVertex.id)
    ) {
      activeItem = layoutVertex.id;
    } else if (children().length) {
      activeItem = children()[0].id;
      dragPosition = "before";
    } else {
      activeItem = layoutVertex.id;
    }
  } else {
    activeItem = layoutVertex.id;
  }

  const fromVertex = fromVertexId ? graph.vertexes[fromVertexId] : undefined;
  if (
    !fromVertex ||
    !validateDragOver(
      graph,
      setGraph,
      fromVertex,
      activeItem,
      formData!,
      dragPosition,
    )
  ) {
    mergeVertexProperties<PageLayoutObject>(
      0,
      layoutStoreVertex.id!,
      graph,
      setGraph,
      { activeItem: null, dragPosition: null },
    );
    return;
  }

  if (
    layoutStoreVertex.P.activeItem !== activeItem ||
    layoutStoreVertex.P.dragPosition !== dragPosition
  ) {
    mergeVertexProperties<PageLayoutObject>(
      0,
      layoutStoreVertex.id!,
      graph,
      setGraph,
      { activeItem, dragPosition },
    );
  }
}

export function clearDropPosition(
  layoutStoreVertex: Vertex<PageLayoutObject>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  mergeVertexProperties<PageLayoutObject>(
    0,
    layoutStoreVertex.id,
    graph,
    setGraph,
    {
      activeItem: null,
      dragPosition: null,
    },
  );
}

export function setRootDropPosition(
  layoutStoreVertex: Vertex<PageLayoutObject>,
  formDataId: Id,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  mergeVertexProperties<PageLayoutObject>(
    0,
    layoutStoreVertex.id,
    graph,
    setGraph,
    {
      activeItem: formDataId,
      dragPosition: "center",
    },
  );
}

export function getFormDataVertex(
  formStoreVertex: Vertex<FormStoreObject> | undefined,
  graph: GraphInterface,
) {
  const formDataId = formStoreVertex?.P.formDataId;
  return formDataId ? graph.vertexes[formDataId] || null : null;
}
