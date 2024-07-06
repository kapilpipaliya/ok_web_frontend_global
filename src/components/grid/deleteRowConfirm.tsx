import { useNavigate } from "@solidjs/router";
import { type Accessor, useContext } from "solid-js";

import { useToast } from "~/components/Toast";
import { submitDataCall } from "~/lib/api/api_functions";
import { GraphContext, type Id } from "~/lib/graph/graph";
import { deleteVertex } from "~/lib/graph/mutate/vertex";
import {
  ProcessStatus} from "~/lib/graph/transaction/TransactionType";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";

export  function deleteRowConfirm(id: Accessor<Id | null>) {
  const [graph, setGraph] = useContext(GraphContext)!;
  const navigate = useNavigate();
  const { showErrorToast, showLoadingToast } = useToast();

  return async() => {
    if (!id()) {
      return;
    }
      const txnId = graph.newTxnId;
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
