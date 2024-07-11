import type { SetStoreFunction, Store } from "solid-js/store";

import { getCompFallbackToString } from "~/lib/graph/get/sync/getCompFallbackToString";
import { getChildVertex } from "~/lib/graph/get/sync/traverse";
import { type GraphInterface, IdAttr, type Vertex } from "~/lib/graph/graph";

import { getSelectionOptions } from "./getSelectionOptions";

export function getComponentForCollRow(
  metaVertex: Vertex,
  data: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
): string {
  const getComponentName = () => {
    return getChildVertex(graph, ["$0Comp"], metaVertex).vertex?.P[IdAttr];
  };

  if (!metaVertex.P.component) {
    return (
      getComponentName() ||
      getCompFallbackToString(metaVertex, graph)?.P[IdAttr]
    );
  }

  if (metaVertex.P.component.includes("-")) {
    const component = getSelectionOptions(
      graph,
      setGraph,
      metaVertex.P.component,
      [data],
    ).vertexes;
    if (!component) {
      return getCompFallbackToString(metaVertex, graph)?.P[IdAttr];
    }
    if (typeof component === "string") {
      return component;
    }
    return component.P[IdAttr];
  }

  return getComponentName() || metaVertex.P.component;
}
