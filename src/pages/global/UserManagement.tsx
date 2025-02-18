import { DataGrid } from "~/features/grid/DataGrid";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";

export function UserManagement() {
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
        componentName: "Text",
        displayName: "Email",
        key: "email",
      },
      {
        componentName: "Text",
        displayName: "Name",
        key: "name",
      },
      {
        componentName: "Text",
        displayName: "Role",
        key: "role",
      },
      {
        componentName: "Text",
        displayName: "Status",
        key: "status",
      },
    ],
    key: "users",
    title: "Users",
  };

  return (
    <DataGrid
      formSchema={UserSchema}
      getTableData={getTableData}
      isShowPagination={true}
      tableId="users"
    />
  );
} 