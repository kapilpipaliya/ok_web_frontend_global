

import { useNavigate } from "@solidjs/router";
import { useContext } from "solid-js";

import type { IFormContext } from "~/lib/contexts";

import { checkIfNameExistsMGCall } from "~/cypher/get/checkIfNameExists";
import { submitDataCall } from "~/lib/api/api_functions";
import { GraphContext, type Id } from "~/lib/graph/graph";
import { ProcessStatus, commitTxn } from "~/lib/graph/transaction";
import { removeLastPathSegment } from "~/lib/removeLastPathSegment";

import { useToast } from "../Toast";

export function formSubmit(txnId: number, id: Id, formData: IFormContext, closePopUp?: () => void) {
  const navigate = useNavigate();
  const { showErrorToast, showLoadingToast, showWarningToast } = useToast();
  const [graph, setGraph] = useContext(GraphContext)!;
  const navigateToParentRoute = () => {
    navigate(removeLastPathSegment());
  };
  
  return async() => {
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
          loadMessage: `Saving ${label}...`,
          onSuccess: (value) => {
            graph.transactions.get(txnId)!.status = ProcessStatus.AckReceived;
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
}