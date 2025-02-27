import type { SetStoreFunction } from "solid-js/store";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { checkUniqueConstrains } from "~/cypher/permissions/checkUniqueConstrains";
import { getErrorMessage } from "~/lib/api/getErrorMessage";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";
import { isDisabledTxn } from "~/lib/graph/transaction/isDisabledTxn";

export function formSubmit(
  formStoreVertex: () => Vertex<FormStoreObject>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  closePopUp: () => void,
  showErrorToast: (message: string) => void,
  showLoadingToast: (options: {
    loadMessage: string;
    onSuccess: (value: any) => void;
    promise: Promise<any>;
    successMessage: string;
  }) => void,
  showWarningToast: (message: string) => void,
) {
  return async (): Promise<string | undefined> => {
    const navigateToParentRoute = () => {
      // navigate(removeLastPathSegment());
    };

    const label = graph.vertexes[formStoreVertex().P.formDataId!]?.L[0]
      .replace(/([A-Z])/g, " $1")
      .trim();
    if (
      graph.vertexes[`txn${formStoreVertex().P.txnId}`]?.P.steps.length === 0
    ) {
      const warningMessage = `There is nothing to save for ${label}.`;
      showWarningToast(warningMessage);
      return warningMessage;
    }
    if (isDisabledTxn(formStoreVertex().P.txnId, graph)) {
      const warningMessage = `${label} is already saved or not changed.`;
      showWarningToast(warningMessage);
      return warningMessage;
    }

    const isValid = true;
    const isRealTime = false;

    if (!isValid) {
      const warningMessage = "Please fix all errors";
      showWarningToast(warningMessage);
      return warningMessage;
    }
    let data;
    // TODO: add validation on form that AttrsTableData keys should not available.
    // !!!TODO!!! Handle Error Received From server when commit
    if (!isRealTime) {
      data = commitTxn(formStoreVertex().P.txnId, graph);
      if (!data) {
        const warningMessage = "No data to Submit";
        showWarningToast(warningMessage);
        return warningMessage;
      }

      const key = graph.vertexes[formStoreVertex().P.formDataId!]?.P.key;

      const res = await checkUniqueConstrains(
        graph.vertexes[formStoreVertex().P.formDataId!],
      );

      if (!isValidResponse(res)) {
        const errorMessage = getErrorMessage(res);
        showErrorToast(errorMessage);
        return errorMessage;
      }

      await showLoadingToast({
        loadMessage: `Saving ${label}...`,
        onSuccess: (value) => {
          for (const item of value.data) {
            if (item.insert) {
              if (item.insert[0] === formStoreVertex().P.formDataId) {
                mergeVertexProperties<FormStoreObject>(
                  0,
                  formStoreVertex().id,
                  graph,
                  setGraph,
                  { formDataId: item.insert[1] },
                );
              }
            }
          }

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
          formStoreVertex().P.txnId,
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

    return;
  };
}
