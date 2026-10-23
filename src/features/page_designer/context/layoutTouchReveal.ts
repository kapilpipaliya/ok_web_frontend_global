import type { StoreSetter as SetStoreFunction } from "solid-js";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";

import type { PageLayoutObject } from "./LayoutContext";

export function setLayoutTouchRevealedId(
  layoutStoreId: Id,
  touchRevealedId: Id | null,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
    touchRevealedId,
  });
}

export function clearLayoutTouchRevealedId(
  layoutStoreId: Id,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  setLayoutTouchRevealedId(layoutStoreId, null, graph, setGraph);
}

export function layoutTouchRevealRowOptions(
  layoutStoreId: Id,
  layoutStoreVertex: () => Vertex<PageLayoutObject> | undefined,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  return {
    touchRevealedId: () => layoutStoreVertex()?.P.touchRevealedId ?? null,
    setTouchRevealedId: (id: Id | null) =>
      setLayoutTouchRevealedId(layoutStoreId, id, graph, setGraph),
  };
}

export function layoutTouchBackgroundHandler(
  layoutStoreId: Id,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  return (event: PointerEvent) => {
    if (event.pointerType !== "touch") return;
    if (!(event.target as HTMLElement).closest("[data-palette-row]")) {
      clearLayoutTouchRevealedId(layoutStoreId, graph, setGraph);
    }
  };
}
