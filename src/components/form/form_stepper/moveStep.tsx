import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { sortChildren } from "~/components/page_designer/functions/sortChildren";

import type { PageLayoutObject } from "../../page_designer/context/LayoutContext";
import { FormStoreObject } from "../FormContext";

export function moveStep(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  layoutStoreId: string,
  steps: Vertex[],
  fromIndex: number,
  toIndex: number,
) {
  const layoutStore = graph.vertexes[layoutStoreId].P as Partial<PageLayoutObject>;
  const formStoreVertex = graph.vertexes[layoutStore.formId!] as Vertex<FormStoreObject>;
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
