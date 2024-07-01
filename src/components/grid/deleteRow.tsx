import type { SetStoreFunction, Store } from "solid-js/store";

import type { useToast } from "~/components/Toast";
import type { GraphInterface, Id } from "~/lib/graph/graph";

import { submitDataCall } from "~/lib/api/api_functions";
import { deleteVertex } from "~/lib/graph/mutate/vertex";
import {
  ProcessStatus,
  commitTransaction,
  getNewTxnId
} from "~/lib/graph/transaction";


export async function deleteRowConfirm(id: Id, graph: Store<GraphInterface>, setGraph: SetStoreFunction<GraphInterface>, showErrorToast: ReturnType<typeof useToast>["showErrorToast"], showLoadingToast: ReturnType<typeof useToast>["showLoadingToast"], navigate: (path: string) => void) {
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
