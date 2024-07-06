import type { SetStoreFunction, Store } from "solid-js/store";

import { untrack } from "solid-js";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { mergeVertexProperties, } from "~/lib/graph/mutate/vertex";

export function setPropertyValueGlobal(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  meta: Vertex,
  layoutVertex: Vertex,
  componentVertex: Vertex,
  value: any,
  valueSet?: boolean,
) {
  return untrack(() => {
    if (valueSet ?? true)
      mergeVertexProperties(txnId, layoutVertex.id, graph, setGraph, { [meta.P.name]: value });
  });
} 