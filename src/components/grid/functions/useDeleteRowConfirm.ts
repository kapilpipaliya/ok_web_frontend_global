import { useNavigate } from "@solidjs/router";

import { useToast } from "~/components/styled/Toast";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { useGraph } from "~/lib/graph/graph";
import { deleteVertex } from "~/lib/graph/mutate/vertex";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";

import type { DataGridState } from "../DataGridContext";

export function useDeleteRowConfirm(gridState: DataGridState) {
  const [graph, setGraph] = useGraph();
  const navigate = useNavigate();
  const { showErrorToast, showLoadingToast } = useToast();

  return async () => {
    if (!gridState.deleteRowId) {
      return;
    }
    if (!(gridState.hasDeletePermission() ?? gridState.isNoPermissionCheck)) {
      showErrorToast("You do not have permission to delete this row.");
      return;
    }
    const txnId = graph.newTxnId;
    const deleteResult = deleteVertex(
      txnId,
      gridState.deleteRowId,
      graph,
      setGraph,
    );
    if (deleteResult?.error) {
      showErrorToast(deleteResult?.error.toString());
      return;
    }
    const data = commitTxn(txnId, graph);
    if (!data) {
      return;
    }
    await showLoadingToast({
      loadMessage: "Deleting Row...",
      onSuccess: () => setTimeout(() => navigate(-1), 0),
      promise: submitDataCall(data, graph, setGraph, txnId),
      successMessage: "Row deleted successfully",
    });
  };
}
