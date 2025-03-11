import { createFileRoute, useParams } from "@tanstack/solid-router";
import { Match, Switch } from "solid-js";

import FileManager from "~/features/file_manager/FileManager";
import { DataGrid } from "~/features/grid/DataGrid";

export const Route = createFileRoute('/admin/_layout2/$entity/')({
  component: TablePage,
})

function TablePage() {
  const params = useParams({strict: false});
  return (
    <>
      <Switch>
        <Match when={params().entity === "Comp"}>
          <FileManager
            parentVertexLabel="Comp"
            rootKeys={{ $or: [{ key: "Root" }] }}
            toParentEdgeType="ParentComp"
          />
        </Match>
        <Match when={true}>
          <DataGrid isShowPagination tableId={params().entity} />
        </Match>
      </Switch>
    </>
  );
}
