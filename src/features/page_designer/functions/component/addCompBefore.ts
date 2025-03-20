import type { SetStoreFunction, Store } from "solid-js/store";

import type { Vertex } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

import { addComponentAttrInPage } from "~/features/page_designer/functions/drag_drop/addComponentAttrInForm";
import { sortChildren } from "~/features/page_designer/functions/layout/sortChildren";

import type { FormStoreObject } from "../../../../components/form/context/FormContext";

export function addCompBefore(
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
