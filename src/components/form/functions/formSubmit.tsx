import { useNavigate } from "@solidjs/router";

import { useFormContext } from "~/components/form/FormContext";
import { checkUniqueConstrains } from "~/cypher/get/checkUniqueConstrains";
import { getErrorMessage } from "~/lib/api/getErrorMessage";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { useGraph } from "~/lib/graph/graph";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";
import { isDisabledTxn } from "~/lib/graph/transaction/isDisabledTxn";

import { useToast } from "../../styled/Toast";

export function formSubmit(closePopUp?: () => void) {
  const _navigate = useNavigate();
  const [formStore] = useFormContext();
  const { showErrorToast, showLoadingToast, showWarningToast } = useToast();
  const [graph, setGraph] = useGraph();

  return async () => {
    const navigateToParentRoute = () => {
      // navigate(removeLastPathSegment());
    };

    const label = graph.vertexes[formStore!.formDataId!]?.L[0].replace(/([A-Z])/g, " $1").trim();
    if (graph.vertexes[`txn${formStore!.txnId}`]?.P.steps.length === 0) {
      showWarningToast(`There is nothing to save for ${label}.`);
    } else if (isDisabledTxn(formStore!.txnId, graph)) {
      showWarningToast(`${label} is already saved or not changed.`);
      return;
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
      data = commitTxn(formStore!.txnId, graph);
      if (!data) {
        showWarningToast("No data to Submit");
        return;
      }

      const key = graph.vertexes[formStore!.formDataId!]?.P.key;

      const res = await checkUniqueConstrains(graph.vertexes[formStore!.formDataId!]);

      if (!isValidResponse(res)) {
        showErrorToast(getErrorMessage(res));
        return;
      }

      await showLoadingToast({
        loadMessage: `Saving ${label}...`,
        onSuccess: (_value) => {
          // currently we are navigating back.
          if (closePopUp) {
            closePopUp();
          } else {
            navigateToParentRoute();
          }
        },
        promise: submitDataCall(
          { ...data, key },
          graph,
          setGraph,
          formStore!.txnId,
        ),
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
