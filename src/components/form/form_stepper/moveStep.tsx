import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { sortChildren } from "~/features/page_designer/functions/sortChildren";

import type { FormStoreObject } from "../context/FormContext";

export function moveStep(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  formStoreVertex: Vertex<FormStoreObject>,
  steps: Vertex[],
  fromIndex: number,
  toIndex: number,
) {
  const fromVertex = steps[fromIndex];
  const toVertex = steps[toIndex];
  const position = toIndex < fromIndex ? "before" : "after";
  sortChildren(
    graph,
    setGraph,
    formStoreVertex.P.txnId || 0,
    fromVertex,
    graph.vertexes[formStoreVertex.P.formDataId!],
    toVertex,
    position,
  );
}
