import type { SetStoreFunction } from "solid-js/store";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { deleteTxnId } from "~/lib/graph/transaction/deleteTxnId";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";
import { removeLastPathSegment } from "~/lib/url/removeLastPathSegment";

export function formCancel(
  formStoreVertex: () => Vertex<FormStoreObject>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  closePopUp: () => void,
  navigate: (path: string) => void,
) {
  const navigateToParentRoute = () => {
    navigate(removeLastPathSegment());
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
