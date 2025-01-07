import { useNavigate } from "@solidjs/router";

import { useFormContext, type FormStoreObject } from "~/components/form/context/FormContext";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { deleteTxnId } from "~/lib/graph/transaction/deleteTxnId";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";
import { removeLastPathSegment } from "~/lib/url/removeLastPathSegment";

export function formCancel(closePopUp?: () => void) {
  const [graph, setGraph] = useGraph();
  const formId = useFormContext();
  const formVertex = () => formId ? graph.vertexes[formId] as Vertex<FormStoreObject> : undefined;
  const navigate = useNavigate();

  const navigateToParentRoute = () => {
    navigate(removeLastPathSegment());
  };

  return () => {
    if (!formVertex()) return;
    revertTransaction(formVertex()?.P.txnId || 0, graph, setGraph);
    deleteTxnId(formVertex()?.P.txnId || 0, graph, setGraph);
    if (closePopUp) {
      closePopUp();
    } else {
      navigateToParentRoute();
    }
  };
}
