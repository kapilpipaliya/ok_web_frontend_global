import type { useToast } from "~/components/Toast";
import {
  commitTransaction,
  getNewTxnId,
  ProcessStatus
} from "~/lib/graph/transaction";
import { deleteVertex } from "~/lib/graph/mutate/vertex";
import type { GraphInterface, Id } from "~/lib/graph/graph";
import type { SetStoreFunction, Store } from "solid-js/store";
import { submitDataCall } from "~/lib/api/api_functions";


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
    promise: submitDataCall(data, graph, setGraph, txnId),
    loadMessage: "Submitting Data...",
    successMessage: "Data submitted successfully",
    onSuccess: () => setTimeout(() => navigate(-1), 0),
  });
}
