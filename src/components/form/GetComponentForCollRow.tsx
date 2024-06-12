import {GraphInterface, IdAttr, Vertex} from "~/lib/graph/graph";
import type {SetStoreFunction, Store} from "solid-js/store";
import {getCollAttrComp} from "~/lib/graph/get/sync/graph_functions";
import {getSelectionOptions} from "~/lib/graph/get/sync/traverse";

export function getComponentForCollRow(
  metaVertex: Vertex,
  data: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (!metaVertex.P.component) {
    return getCollAttrComp(metaVertex, graph)?.P[IdAttr];
  }
  if (metaVertex.P.component.includes("-")) {
    return getSelectionOptions(graph, setGraph, [data], metaVertex.P.component)
      .vertexes;
  }
  return metaVertex.P.component as string;
}