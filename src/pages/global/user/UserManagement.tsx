import { DataGrid } from "~/features/grid/DataGrid";
import { DataGridStore } from "~/features/grid/DataGridContext";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";

import { AddUserForm } from "./AddUserForm";

export function UserManagement() {
  let gridStore: DataGridStore;
  const getTableData = async () => {
    const data = await getAPI(API.user.getUsersListUrl);
    return {
      graph: {
        edges: {},
        vertexes: {},
      },
      result: data.users,
    };
  };

  const UserSchema = {
    attributes: [
      {
        componentName: "TextInput",
        displayName: "Username",
        key: "username",
      },
      {
        componentName: "TextInput",
        displayName: "Email",
        key: "email",
      },
      {
        componentName: "TextInput",
        displayName: "Name",
        key: "name",
      },
      {
        collection: "g:'Role'",
        componentName: "MultiSelect",
        key: "role",
      },
      {
        componentName: "Select",
        displayName: "Status",
        key: "status",
        options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ],
      },
    ],
    key: "users",
    title: "Users",
  };

  return (
    <DataGrid
      CustomAddNewButton={() => (
        <AddUserForm
          onSuccess={() => {
            gridStore?.[0].fetchTableData();
          }}
        />
      )}
      formSchema={UserSchema}
      getTableData={getTableData}
      initializeGridStoreParent={(gridStore_) => {
        gridStore = gridStore_;
      }}
      isShowPagination={true}
      tableId="users"
    />
  );
}
