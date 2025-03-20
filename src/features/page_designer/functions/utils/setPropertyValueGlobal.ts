import type { SetStoreFunction, Store } from "solid-js/store";

import { untrack } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";

export function setPropertyValueGlobal(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  meta: Vertex,
  layoutVertex: Vertex,
  value: any,
  valueSet?: boolean,
) {
  return untrack(() => {
    if (valueSet ?? true) {
      mergeVertexProperties(txnId, layoutVertex.id, graph, setGraph, {
        [meta.P.key]: value,
      });
    }
  });
}
