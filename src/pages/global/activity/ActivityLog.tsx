import type { DataGridStore } from "~/features/grid/DataGridContext";

import { DataGrid } from "~/features/grid/DataGrid";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";

export function ActivityLog() {
  let _gridStore: DataGridStore;
  const getTableData = async () => {
    return await getAPI(API.settings.activity.getUrl);
  };

  const ActivityLogSchema = {
    attributes: [
      {
        componentName: "TextInput",
        displayName: "Action",
        key: "action",
      },
      {
        componentName: "TextInput",
        displayName: "Entity Type",
        key: "entityType",
      },
      {
        componentName: "TextInput",
        displayName: "Entity ID",
        key: "entityId",
      },
      {
        componentName: "TextInput",
        displayName: "User",
        key: "user",
      },
      {
        componentName: "TextInput",
        displayName: "Description",
        key: "description",
      },
      {
        componentName: "TextInput",
        displayName: "Created At",
        key: "createdAt",
      },
    ],
    isInlineEditable: true,
    key: "ActivityLog",
    title: "Activity Log",
  };

  return (
    <DataGrid
      CustomAddNewButton={() => <div />}
      formSchema={ActivityLogSchema}
      getTableData={getTableData}
      hideDeleteAction={true}
      hideEditJsonAction={true}
      initializeGridStoreParent={(gridStore_) => {
        _gridStore = gridStore_;
      }}
      isShowPagination={true}
      tableId="ActivityLog"
    />
  );
}
