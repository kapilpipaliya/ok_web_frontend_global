import { useParams } from "@solidjs/router";
import { Match, Switch } from "solid-js";

import { DataGrid } from "~/components/grid/DataGrid";
import FileManager from "~/features/file_manager/FileManager";
import { UserDropdownMenuDisplay } from "~/pages/auth_menu/DropdownMenuDisplay";

export default function TablePage() {
  const params = useParams();
  return (
    <>
      <div class="flex gap:4 ml:auto">
        <UserDropdownMenuDisplay />
      </div>
      <Switch>
        <Match when={params.entity === "Comp"}>
          <FileManager
            parentVertexLabel="Comp"
            rootKeys={{ $or: [{ key: "Root" }] }}
            toParentEdgeType="ParentComp"
          />
        </Match>
        <Match when={true}>
          <DataGrid isShowPagination tableId={params.entity} />
        </Match>
      </Switch>
    </>
  );
}
