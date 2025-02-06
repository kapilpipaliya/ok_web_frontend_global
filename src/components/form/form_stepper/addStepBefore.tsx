import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { addComponentAttrInPage } from "~/components/page_designer/functions/drop/addComponentAttrInForm";
import { sortChildren } from "~/components/page_designer/functions/sortChildren";

import type { FormStoreObject } from "../context/FormContext";

export function addStepBefore(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  formStoreVertex: Vertex<FormStoreObject>,
  formVertex: Vertex,
  toVertex: Vertex,
) {
  const formDataId = formStoreVertex?.P?.formDataId;
  const txnId = formStoreVertex?.P?.txnId || 0;

  const layoutRowId = addComponentAttrInPage(
    formVertex,
    graph.vertexes[formDataId!],
    txnId,
    graph,
    setGraph,
    "Step",
  );

  if (layoutRowId === -1) {
    return;
  }

  const fromVertex = graph.vertexes[layoutRowId];

  sortChildren(
    graph,
    setGraph,
    txnId,
    fromVertex,
    graph.vertexes[formDataId!],
    toVertex,
    "before",
  );

  // setLayoutStore('activeStepId', layoutRowId);
}
