import type { DataGridStore } from "~/features/grid/DataGridContext";

import { DataGrid } from "~/features/grid/DataGrid";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";

export function EmailAudit() {
  let gridStore: DataGridStore;
  const getTableData = async () => {
    return await getAPI(API.email.auditUrl);
  };

  const EmailAuditSchema = {
    attributes: [
      {
        componentName: "TextInput",
        displayName: "From",
        key: "from",
      },
      {
        componentName: "TextInput",
        displayName: "To",
        key: "to",
      },
      {
        componentName: "TextInput",
        displayName: "Subject",
        key: "subject",
      },
      {
        componentName: "TextInput",
        displayName: "Status",
        key: "status",
      },
      {
        componentName: "TextInput",
        displayName: "Sent At",
        key: "sentAt",
      },
      {
        componentName: "TextInput",
        displayName: "Message ID",
        key: "messageId",
      }
    ],
    isInlineEditable: false,
    key: "emails",
    title: "Email Audit Log"
  };

  return (
    <DataGrid
      CustomAddNewButton={() => <div></div>}
      formSchema={EmailAuditSchema}
      getTableData={getTableData}
      initializeGridStoreParent={(gridStore_) => {
        gridStore = gridStore_;
      }}
      isShowPagination={true}
      tableId="emails"
    />
  );
} 