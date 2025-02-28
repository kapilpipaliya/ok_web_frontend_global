import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface } from "~/lib/graph/graph";

import { submitDataCall } from "~/lib/api/service/data/submitDataCall";

import { commitTxn } from "../../transaction/core/commitTxn";

export async function handleDataSubmission(
  newFormTxnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  showErrorToast: (message: string) => void,
  showSuccessToast: (message: string) => void,
  options: {
    commitErrorMessage?: string;
    errorMessage?: string;
    successMessage?: null | string;
  } = {},
) {
  const commitData = commitTxn(newFormTxnId, graph);

  if (!commitData) {
    return false;
    // showErrorToast(
    //   options.commitErrorMessage || "Failed to commit transaction",
    // );
    // return false;
  }
  try {
    await submitDataCall({ ...commitData }, graph, setGraph, newFormTxnId);
    if (options.successMessage !== null) {
      showSuccessToast(
        options.successMessage || "Transaction committed successfully",
      );
    }
    return true;
  } catch (_error) {
    if (options.errorMessage !== null) {
      showErrorToast(
        options.errorMessage ||
          "An error occurred while committing the transaction",
      );
    }
    return false;
  }
}
