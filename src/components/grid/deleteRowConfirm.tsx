import { useNavigate } from "@solidjs/router";
import { useContext } from "solid-js";

import { useToast } from "~/components/Toast";
import { submitDataCall } from "~/lib/api/api_functions";
import { GraphContext, type Id } from "~/lib/graph/graph";
import { deleteVertex } from "~/lib/graph/mutate/vertex";
import {
  ProcessStatus,
  commitTransaction,
  getNewTxnId
} from "~/lib/graph/transaction";

export  function deleteRowConfirm(id: Id) {
  const [graph, setGraph] = useContext(GraphContext)!;
  const navigate = useNavigate();
  const { showErrorToast, showLoadingToast } = useToast();

  return async() => {
      const txnId = getNewTxnId(graph, setGraph);
      const deleteResult = deleteVertex(txnId, id, graph, setGraph);
      if (deleteResult?.error) {
        showErrorToast(deleteResult?.error.toString());
        return;
      }
      graph.transactions.get(txnId)!.status = ProcessStatus.Ready;
      const data = commitTransaction(txnId, graph);
      if (!data) {
        return;
      }
      await showLoadingToast({
        loadMessage: "Submitting Data...",
        onSuccess: () => setTimeout(() => navigate(-1), 0),
        promise: submitDataCall(data, graph, setGraph, txnId),
        successMessage: "Data submitted successfully",
      });
  }
}
