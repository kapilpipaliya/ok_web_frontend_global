import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { deleteLayoutAttr } from "~/components/page_designer/event_handler/deleteLayoutAttr";

import type { PageLayoutObject } from "../../page_designer/context/LayoutContext";

export function deleteStep(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  layoutStore: Store<PageLayoutObject>,
  setLayoutStore: SetStoreFunction<PageLayoutObject>,
  steps: Vertex[],
  item: Vertex,
  showErrorToast: (message: string) => void,
  showSuccessToast: (message: string) => void,
) {
  if (steps.length === 1) {
    showErrorToast("You cannot delete the last step");
    return;
  }
  const currentStep = steps.findIndex((step) => step.id === item.id);
  if (currentStep) {
    if (currentStep === 0) {
      // setLayoutStore('activeStepId', steps[currentStep + 1].id);
    } else {
      // setLayoutStore('activeStepId', steps[currentStep - 1].id);
    }
  }
  deleteLayoutAttr(
    layoutStore,
    setLayoutStore,
    item,
    graph,
    setGraph,
    layoutStore.formStore[0].txnId,
    item.P.key,
    showSuccessToast,
  );
}
