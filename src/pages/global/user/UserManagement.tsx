import type { DataGridStore } from "~/features/grid/DataGridContext";

import { DataGrid } from "~/features/grid/DataGrid";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";

import { AddUserForm } from "./AddUserForm";
import { getUserFormSchema } from "./userFormSchema";

export function UserManagement() {
  let gridStore: DataGridStore;
  const getTableData = async () => {
    return await getAPI(API.user.getUsersListUrl);
  };
  const onSuccess = () => {
    gridStore?.[0].fetchTableData();
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
    isInlineEditable: true,
    key: "users",
    title: "Users",
  };

  const editSchema = getUserFormSchema(onSuccess);

  return (
    <DataGrid
      CustomAddNewButton={() => (
        <AddUserForm
          onSuccess={onSuccess}
        />
      )}
      editSchema={editSchema}
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
