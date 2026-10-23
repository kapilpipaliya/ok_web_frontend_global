import type { StoreSetter as SetStoreFunction } from "solid-js";

import { useNavigate } from "@solidjs/router";

import { useToast } from "~/components/styled/modal/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";

import type { DataGridState } from "../context/DataGridContext";
import { deleteVertex } from "~/lib/graph/mutate/core/vertex/deleteVertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function useDeleteRowConfirm(
  gridState: DataGridState,
  setGridState: SetStoreFunction<DataGridState>,
) {
  const [graph, setGraph] = useGraph();
  const navigate = useNavigate();
  const { showErrorToast, showLoadingToast, showSuccessToast } = useToast();

  return async () => {
    if (!gridState.deleteRowId) {
      return;
    }
    if (gridState.isDeletingRow) {
      return;
    }
    if (!(gridState.hasFullPermission() ?? gridState.isNoPermissionCheck)) {
      showErrorToast("You do not have permission to delete this row.");
      return;
    }
    const deleteEndpoint = getDeleteEndpoint(gridState.tableId!);

    if (!deleteEndpoint) {
      showErrorToast(`Delete not supported for ${gridState.tableId}`);
      return;
    }
    if (deleteEndpoint) {
      try {
        setGridState((d) => { d.isDeletingRow = true; });
        // For subdomains, use 'key' property from the vertex instead of 'id'
        let deletePayload: { id?: string; key?: string };

        if (gridState.tableId === "subdomains") {
          const subdomain = graph.vertexes[gridState.deleteRowId];
          if (!subdomain?.P?.key) {
            showErrorToast("Subdomain key not found");
            return;
          }
          deletePayload = { key: subdomain.P.key };
        } else {
          deletePayload = { id: gridState.deleteRowId };
        }

        const result = await postAPI(deleteEndpoint, deletePayload, "DELETE");

        if (result.success) {
          if (result.graph) {
            setGraphData(graph, setGraph, result.graph);
          }
          showSuccessToast(`${gridState.tableId} deleted successfully`);
          gridState.fetchTableData();
        } else {
          showErrorToast(
            result.error || `Failed to delete ${gridState.tableId}`,
          );
        }
      } catch (error) {
        showErrorToast(`Error deleting ${gridState.tableId}: ${error.message}`);
      } finally {
        setGridState((d) => { d.isDeletingRow = false; });
        setGridState((d) => { d.deleteRowId = null; });
      }
      return;
    }

    try {
      setGridState((d) => { d.isDeletingRow = true; });
      const txnId = generateNewTxnId(graph, setGraph);
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
    } finally {
      setGridState((d) => { d.isDeletingRow = false; });
      setGridState((d) => { d.deleteRowId = null; });
    }
  };
}

function getDeleteEndpoint(tableId: string) {
  switch (tableId) {
    case "File":
      return API.file.deleteFileUrl;
    case "Page":
    case "Component":
    case "EmailTemplate":
    case "Function":
      return API.page.deletePageUrl;
    case "Perm":
      return API.permission.deletePermissionUrl;
    case "Role":
      return API.role.deleteRoleUrl;
    case "subdomains":
      return API.subdomain.deleteUrl;
    case "Support":
      return API.support.deleteTicketUrl;
    case "User":
      return API.user.deleteUserUrl;
    default:
      return null;
  }
}
