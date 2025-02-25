import type { DataGridStore } from "~/features/grid/DataGridContext";

import { DataGrid } from "~/features/grid/DataGrid";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";

import { getEmailAuditFormSchema } from "./emailAuditFormSchema";

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
      },
    ],
    isInlineEditable: true,
    key: "Email",
    title: "Email Audit Log",
  };

  const onSuccess = () => {
    gridStore?.[0].fetchTableData();
  };

  const editSchema = getEmailAuditFormSchema(onSuccess);

  return (
    <DataGrid
      CustomAddNewButton={() => <div />}
      editSchema={editSchema}
      formSchema={EmailAuditSchema}
      getTableData={getTableData}
      hideDeleteAction={true}
      hideEditJsonAction={true}
      initializeGridStoreParent={(gridStore_) => {
        gridStore = gridStore_;
      }}
      isShowPagination={true}
      tableId="emails"
    />
  );
}
