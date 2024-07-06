

import { useNavigate } from "@solidjs/router";
import { useContext } from "solid-js";

import type { IFormContext } from "~/lib/contexts";

import { checkIfNameExistsMGCall } from "~/cypher/get/checkIfNameExists";
import { submitDataCall } from "~/lib/api/api_functions";
import { GraphContext, } from "~/lib/graph/graph";
import { ProcessStatus } from "~/lib/graph/transaction/TransactionType";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";
import { isDisabledTxn } from "~/lib/graph/transaction/isDisabledTxn";
import { updateSubmittedStepToLast } from "~/lib/graph/transaction/updateSubmittedStepToLast";

import { useToast } from "../Toast";

export function formSubmit(formData: IFormContext, closePopUp?: () => void) {
  const navigate = useNavigate();
  const { showErrorToast, showLoadingToast, showWarningToast } = useToast();
  const [graph, setGraph] = useContext(GraphContext)!;

  return async () => {
    const txnId = formData.txnId;
    const navigateToParentRoute = () => {
      // navigate(removeLastPathSegment());
    };

    const label = formData.formData.L[0].replace(/([A-Z])/g, ' $1').trim();
    if (graph.transactions.get(txnId)?.steps.length === 0) {
      showWarningToast(`There is nothing to save for ${label}.`)
    } else if (isDisabledTxn(txnId, graph)) {
      showWarningToast(`${label} is already saved.`)
    }

    const isValid = true;
    const isRealTime = false;

    if (!isValid) {
      showWarningToast("please fix all errors");
      return false;
    }
    let data;
    // TODO: add validation on form that AttrsTableData keys should not available.
    // !!!TODO!!! Handle Error Received From server when commit
    if (!isRealTime) {
      data = commitTxn(txnId, graph);
      if (!data) {
        showWarningToast("No data to Submit");
        return;
      }

      const name = formData?.formData?.P.name;

      const res = await checkIfNameExistsMGCall(
        formData.formMeta.L[0],
        name,
        formData.formData.id,
      );

      if (res.error) {
        showErrorToast(res.message);
        return;
      }

      await showLoadingToast({
        loadMessage: `Saving ${label}...`,
        onSuccess: (value) => {
          graph.transactions.get(txnId)!.status = ProcessStatus.AckReceived;
          updateSubmittedStepToLast(txnId, graph);
          // currently we are navigating back.
          if (closePopUp) {
            closePopUp();
          } else {
            navigateToParentRoute();
          }
        },
        promise: submitDataCall({ ...data, name }, graph, setGraph, txnId),
        successMessage: `${label} Saved Successfully`,
      });
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
}