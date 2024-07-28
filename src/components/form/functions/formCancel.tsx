import { useNavigate } from "@solidjs/router";

import { useFormContext } from "~/components/form/FormContext";
import { useGraph } from "~/lib/graph/graph";
import { deleteTxnId } from "~/lib/graph/transaction/deleteTxnId";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";
import { removeLastPathSegment } from "~/lib/url/removeLastPathSegment";

export function formCancel(closePopUp?: () => void) {
  const [graph] = useGraph();
  const { txnId } = useFormContext();
  const navigate = useNavigate();

  const navigateToParentRoute = () => {
    navigate(removeLastPathSegment());
  };

  return () => {
    revertTransaction(txnId, graph);
    deleteTxnId(txnId, graph);
    if (!closePopUp) {
      navigateToParentRoute();
    } else {
      closePopUp();
    }
  };
}
