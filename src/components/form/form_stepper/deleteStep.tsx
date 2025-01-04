import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { deleteLayoutAttr } from "~/components/page_designer/event_handler/deleteLayoutAttr";

import type { PageLayoutObject } from "../../page_designer/context/LayoutContext";
import { FormStoreObject } from "../FormContext";

export function deleteStep(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  layoutStoreId: string,
  steps: Vertex[],
  item: Vertex,
  showErrorToast: (message: string) => void,
  showSuccessToast: (message: string) => void,
) {
  if (steps.length === 1) {
    showErrorToast("You cannot delete the last step");
    return;
  }

  const layoutStore = graph.vertexes[layoutStoreId].P as Partial<PageLayoutObject>;
  const formStoreVertex = graph.vertexes[layoutStore.formId!] as Vertex<FormStoreObject>;
  const txnId = formStoreVertex?.P?.txnId || 0;

  const currentStep = steps.findIndex((step) => step.id === item.id);
  if (currentStep) {
    if (currentStep === 0) {
      // setLayoutStore('activeStepId', steps[currentStep + 1].id);
    } else {
      // setLayoutStore('activeStepId', steps[currentStep - 1].id);
    }
  }

  deleteLayoutAttr(
    layoutStore.id!,
    setGraph,
    item,
    graph,
    setGraph,
    txnId,
    item.P.key,
    showSuccessToast,
  );
}
