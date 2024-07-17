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

  if (!metaVertex.P.componentName) {
    return (
      getComponentName() ||
      getCompFallbackToString(metaVertex, graph)?.P[IdAttr]
    );
  }

  if (metaVertex.P.componentName.includes("-")) {
    const componentName = getSelectionOptions(
      graph,
      setGraph,
      metaVertex.P.componentName,
      [data],
    ).vertexes;
    if (!componentName) {
      return getCompFallbackToString(metaVertex, graph)?.P[IdAttr];
    }
    if (typeof componentName === "string") {
      return componentName;
    }
    return componentName.P[IdAttr];
  }

  return getComponentName() || metaVertex.P.componentName;
}
