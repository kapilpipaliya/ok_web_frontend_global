import type { IFormContext } from "~/lib/contexts";
import type { GraphInterface, Id } from "~/lib/graph/graph";
import type { SetStoreFunction, Store } from "solid-js/store";
import { commitTxn, ProcessStatus } from "~/lib/graph/transaction";
import { checkIfNameExistsMGCall } from "~/cypher/get/checkIfNameExists";
import { submitDataCall } from "~/lib/api/api_functions";

export async function formSubmit(formData: IFormContext, id: Id, txnId: number, graph: Store<GraphInterface>, setGraph: SetStoreFunction<GraphInterface>, showLoadingToast: any, showWarningToast: any, showErrorToast: any, navigateToParentRoute: () => void, closePopUp?: () => void) {
  const isValid = true;
  const isRealTime = false;
  let data;
  if (isValid) {
    // TODO: add validation on form that AttrsTableData keys should not available.
    // !!!TODO!!! Handle Error Received From server when commit
    if (!isRealTime) {
      data = commitTxn(txnId, graph);
      if (!data) {
        if (closePopUp) {
          closePopUp();
        } else {
          navigateToParentRoute();
        }
        showWarningToast("Internal Server Error");
        return;
      }

      const name = formData?.formData?.P.name;

      const res = await checkIfNameExistsMGCall(
        formData.formMeta.L[0],
        name,
        id,
      );

      if (res.error) {
        showErrorToast(res.message);
        return;
      }

      const label = formData.formData.L[0].replace(/([A-Z])/g, ' $1').trim();
      await showLoadingToast({
        promise: submitDataCall({ ...data, name }, graph, setGraph, txnId),
        loadMessage: `Saving ${label}...`,
        successMessage: `${label} Saved Successfully`,
        onSuccess: (value) => {
          graph.transactions.get(txnId)!.status = ProcessStatus.AckReceived;
          // currently we are navigating back.
          if (closePopUp) {
            closePopUp();
          } else {
            navigateToParentRoute();
          }
        },
      });
    }
  } else {
    showWarningToast("please fix all errors");
  }
  if (!data) {
    if (closePopUp) {
      closePopUp();
    } else {
      navigateToParentRoute();
    }
    return;
  }

  return isValid;
}