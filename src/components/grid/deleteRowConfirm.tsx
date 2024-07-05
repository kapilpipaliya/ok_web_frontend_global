import { useNavigate } from "@solidjs/router";
import { Accessor, useContext } from "solid-js";

import { useToast } from "~/components/Toast";
import { submitDataCall } from "~/lib/api/api_functions";
import { GraphContext, type Id } from "~/lib/graph/graph";
import { deleteVertex } from "~/lib/graph/mutate/vertex";
import {
  ProcessStatus,
  commitTxn,
  getNewTxnId
} from "~/lib/graph/transaction";

export  function deleteRowConfirm(id: Accessor<Id | null>) {
  const [graph, setGraph] = useContext(GraphContext)!;
  const navigate = useNavigate();
  const { showErrorToast, showLoadingToast } = useToast();

  return async() => {
    if (!id()) {
      return;
    }
      const txnId = getNewTxnId(graph, setGraph);
      const deleteResult = deleteVertex(txnId, id()!, graph, setGraph);
      if (deleteResult?.error) {
        showErrorToast(deleteResult?.error.toString());
        return;
      }
      graph.transactions.get(txnId)!.status = ProcessStatus.Ready;
      const data = commitTxn(txnId, graph);
      if (!data) {
        return;
      }
      await showLoadingToast({
        loadMessage: "Deleting Row...",
        onSuccess: () => setTimeout(() => navigate(-1), 0),
        promise: submitDataCall(data, graph, setGraph, txnId),
        successMessage: "Row deleted successfully",
      });
  }
}
