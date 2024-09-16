import { Store, SetStoreFunction } from "solid-js/store";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { GraphInterface } from "~/lib/graph/graph";
import { commitTxn } from "../transaction/commitTxn";
export async function handleDataSubmission(
  newFormTxnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  showErrorToast: (message: string) => void,
  showSuccessToast: (message: string) => void,
  options: {
    errorMessage?: string;
    successMessage?: string | null;
    commitErrorMessage?: string;
  } = {}
) {
  const commitData = commitTxn(newFormTxnId, graph);

  if (!commitData) {
    showErrorToast(options.commitErrorMessage || "Failed to commit transaction");
    return false;
  }
  try {
    await submitDataCall({ ...commitData }, graph, setGraph, newFormTxnId);
    if (options.successMessage !== null) {
      showSuccessToast(options.successMessage || "Transaction committed successfully");
    }
    return true;
  } catch (_error) {
    if (options.errorMessage !== null) {
      showErrorToast(options.errorMessage || "An error occurred while committing the transaction");
    }
    return false;
  }
}