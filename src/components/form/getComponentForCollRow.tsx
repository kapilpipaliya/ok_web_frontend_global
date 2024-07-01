import {type GraphInterface, IdAttr, type Vertex} from "~/lib/graph/graph";
import type {SetStoreFunction, Store} from "solid-js/store";
import { getCompFallbackToString } from "~/lib/graph/get/sync/getCompFallbackToString";
import {getChildVertex, getSelectionOptions} from "~/lib/graph/get/sync/traverse";

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
    return getComponentName() || getCompFallbackToString(metaVertex, graph)?.P[IdAttr];
  }

  if (metaVertex.P.component.includes("-")) {
    const component = getSelectionOptions(graph, setGraph, [data], metaVertex.P.component).vertexes;
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
