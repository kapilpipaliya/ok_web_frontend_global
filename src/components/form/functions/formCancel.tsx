import type { SetStoreFunction } from "solid-js/store";

import { UseNavigateResult } from "@tanstack/solid-router";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { deleteTxnId } from "~/lib/graph/transaction/core/deleteTxnId";
import { revertTransaction } from "~/lib/graph/transaction/revert/revertTransaction";

export function formCancel(
  formStoreVertex: () => Vertex<FormStoreObject>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  closePopUp: () => void,
  navigate: UseNavigateResult<string>,
) {
  const navigateToParentRoute = () => {
    navigate({ to: removeLastPathSegment() });
  };

  return () => {
    if (!formStoreVertex()) {
      return;
    }
    revertTransaction(formStoreVertex()?.P.txnId || 0, graph, setGraph);
    deleteTxnId(formStoreVertex()?.P.txnId || 0, graph, setGraph);
    if (closePopUp) {
      closePopUp();
    } else {
      navigateToParentRoute();
    }
  };
}

function removeLastPathSegment() {
  const pathname = window.location.pathname;
  const segments = pathname.split("/");
  segments.pop();
  return segments.join("/");
}
