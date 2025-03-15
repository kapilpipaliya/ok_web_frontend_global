import type { DataGridStore } from "~/features/grid/DataGridContext";

import { DataGrid } from "~/features/grid/DataGrid";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";

import { SchemaRenderer } from "../../SchemaRenderer";
import { getActivityLogFormSchema } from "./functions/getActivityLogFormSchema";

export function ActivityLog() {
  let gridStore: DataGridStore;
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

  const onSuccess = () => {
    gridStore?.[0].fetchTableData();
  };

  const addSchema = getActivityLogFormSchema(onSuccess);
  const editSchema = getActivityLogFormSchema(onSuccess);

  return (
    <DataGrid
      CustomAddNewButton={() => <></>}
      editSchema={editSchema}
      formSchema={ActivityLogSchema}
      getTableData={getTableData}
      hideDeleteAction={true}
      hideEditAction={true}
      hideEditJsonAction={true}
      initializeGridStoreParent={(gridStore_) => {
        gridStore = gridStore_;
      }}
      isShowPagination={true}
      tableId="ActivityLog"
    />
  );
}
