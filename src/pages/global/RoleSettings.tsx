import { DataGrid } from "~/features/grid/DataGrid";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";

export function RoleSettings() {
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
        key: "name",
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
      formSchema={RoleSchema}
      getTableData={getTableData}
      isShowPagination={true}
      tableId="roles"
    />
  );
}
