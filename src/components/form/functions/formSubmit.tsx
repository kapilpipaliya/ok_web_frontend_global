import { useNavigate } from "@solidjs/router";

import { useFormContext } from "~/components/form/FormContext";
import { checkUniqueConstrains } from "~/cypher/get/checkUniqueConstrains";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { useGraph } from "~/lib/graph/graph";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";
import { isDisabledTxn } from "~/lib/graph/transaction/isDisabledTxn";

import { useToast } from "../../Toast";

export function formSubmit(closePopUp?: () => void) {
  const _navigate = useNavigate();
  const [formStore] = useFormContext();
  const { showErrorToast, showLoadingToast, showWarningToast } = useToast();
  const [graph, setGraph] = useGraph();

  return async () => {
    const navigateToParentRoute = () => {
      // navigate(removeLastPathSegment());
    };

    const label = formStore!.formData!.L[0].replace(/([A-Z])/g, " $1").trim();
    if (graph.transactions.get(formStore!.txnId)?.steps.length === 0) {
      showWarningToast(`There is nothing to save for ${label}.`);
    } else if (isDisabledTxn(formStore!.txnId, graph)) {
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
      data = commitTxn(formStore!.txnId, graph);
      if (!data) {
        showWarningToast("No data to Submit");
        return;
      }

      const name = formStore!.formData!.P.name;

      const res = await checkUniqueConstrains(
        formStore!.formData!,
      );

      if (res.error) {
        showErrorToast(res.message);
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
        promise: submitDataCall({ ...data, name }, graph, setGraph, formStore!.txnId),
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
