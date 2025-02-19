import { DataGrid } from "~/features/grid/DataGrid";
import { DataGridStore } from "~/features/grid/DataGridContext";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";

import { AddRoleForm } from "./AddRoleForm";

export function RoleSettings() {
  let gridStore: DataGridStore;
  const getTableData = async () => {
    const data = await getAPI(API.role.getRolesUrl);
    return {
      graph: {
        edges: {},
        vertexes: {},
      },
      result: data.roles,
    };
  };

  const RoleSchema = {
    attributes: [
      {
        componentName: "Text",
        displayName: "Name",
        key: "key",
      },
      {
        componentName: "Text",
        displayName: "Description",
        key: "description",
      },
      {
        componentName: "Text",
        displayName: "Permissions",
        key: "permissions",
      },
    ],
    key: "roles",
    title: "Roles",
  };

  return (
    <DataGrid
      CustomAddNewButton={() => (
        <AddRoleForm
          onSuccess={() => {
            gridStore?.[0].fetchTableData();
          }}
        />
      )}
      formSchema={RoleSchema}
      getTableData={getTableData}
      initializeGridStoreParent={(gridStore_) => {
        gridStore = gridStore_;
      }}
      isShowPagination={true}
      tableId="roles"
    />
  );
}
