import { useParams } from "@solidjs/router";
import { Match, Switch } from "solid-js";

import { GridWrapper } from "~/components/grid/GridWrapper";
import FileManager from "~/pages/file_manager/FileManager";

export default function TablePage() {
  const params = useParams();
  return (
    <Switch>
      <Match when={params.entity === "Comp"}>
        <FileManager
          parentVertexLabel="Comp"
          rootKeys={{ $or: [{ key: "Root" }, { key: "ArkUI" }] }}
          toParentEdgeType="ParentComp"
        />
      </Match>
      <Match when={true}>
        <GridWrapper tableId={params.entity} />
      </Match>
    </Switch>
  );
}
