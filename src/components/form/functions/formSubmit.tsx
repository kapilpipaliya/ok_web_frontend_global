import { useNavigate } from "@solidjs/router";

import { useFormContext, type FormStoreObject } from "~/components/form/FormContext";
import { checkUniqueConstrains } from "~/cypher/get/checkUniqueConstrains";
import { getErrorMessage } from "~/lib/api/getErrorMessage";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";
import { isDisabledTxn } from "~/lib/graph/transaction/isDisabledTxn";

import { useToast } from "../../styled/Toast";

export function formSubmit(closePopUp?: () => void) {
  const _navigate = useNavigate();
  const formId = useFormContext();
  const { showErrorToast, showLoadingToast, showWarningToast } = useToast();
  const [graph, setGraph] = useGraph();
  const formVertex = () => graph.vertexes[formId!] as Vertex<FormStoreObject>;

  return async () => {
    const navigateToParentRoute = () => {
      // navigate(removeLastPathSegment());
    };

    const label = graph.vertexes[formVertex().P.formDataId!]?.L[0].replace(/([A-Z])/g, " $1").trim();
    if (graph.vertexes[`txn${formVertex().P.txnId}`]?.P.steps.length === 0) {
      showWarningToast(`There is nothing to save for ${label}.`);
    } else if (isDisabledTxn(formVertex().P.txnId, graph)) {
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
      data = commitTxn(formVertex().P.txnId, graph);
      if (!data) {
        showWarningToast("No data to Submit");
        return;
      }

      const key = graph.vertexes[formVertex().P.formDataId!]?.P.key;

      const res = await checkUniqueConstrains(graph.vertexes[formVertex().P.formDataId!]);

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
          formVertex().P.txnId,
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
