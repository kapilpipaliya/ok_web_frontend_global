import { useNavigate } from "@solidjs/router";

import { checkUniqueConstrains } from "~/cypher/get/checkUniqueConstrains";
import { submitDataCall } from "~/lib/api/api_functions";
import { useFormContext } from "~/lib/contexts";
import { useGraph } from "~/lib/graph/graph";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";
import { isDisabledTxn } from "~/lib/graph/transaction/isDisabledTxn";

import { useToast } from "../../Toast";

export function formSubmit(closePopUp?: () => void) {
  const navigate = useNavigate();
  const formData = useFormContext();
  const { showErrorToast, showLoadingToast, showWarningToast } = useToast();
  const [graph, setGraph] = useGraph();

  return async () => {
    const txnId = formData.txnId;
    const navigateToParentRoute = () => {
      // navigate(removeLastPathSegment());
    };

    const label = formData.formData.L[0].replace(/([A-Z])/g, " $1").trim();
    if (graph.transactions.get(txnId)?.steps.length === 0) {
      showWarningToast(`There is nothing to save for ${label}.`);
    } else if (isDisabledTxn(txnId, graph)) {
      showWarningToast(`${label} is already saved.`);
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

      const res = await checkUniqueConstrains(
        formData.formData,
      );

      if (res.error) {
        showErrorToast(res.message);
        return;
      }

      await showLoadingToast({
        loadMessage: `Saving ${label}...`,
        onSuccess: (value) => {
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
  };
}
