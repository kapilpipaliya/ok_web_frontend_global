import { useParams } from "@solidjs/router";
import { Match, Switch } from "solid-js";

import { DataGrid } from "~/components/grid/DataGrid";
import { UserDropdownMenuDisplay } from "~/pages/admin_layout/DropdownMenuDisplay";
import { SelectThemeButton } from "~/pages/admin_layout/theme/SelectThemeButton";
import FileManager from "~/pages/file_manager/FileManager";

export default function TablePage() {
  const params = useParams();
  return (
    <>
      <div class="flex gap:4 ml:auto">
        <SelectThemeButton />
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
