import { Navigate, useParams, useSearchParams } from "@solidjs/router";
import { Match, Switch } from "solid-js";

import FileManager from "~/features/file_manager/FileManager";
import { DataGrid } from "~/features/grid/DataGrid";
import {
  buildPageDesignerUrl,
  isPageDesignerEntity,
} from "~/features/page_designer/utils/pageDesignerUrl";

export default function TablePage() {
  const params = useParams();
  const [searchParams] = useSearchParams();

  const tabsParam = searchParams.tabs;
  const tabsValue = Array.isArray(tabsParam) ? tabsParam[0] : tabsParam;
  const shouldOpenDesigner =
    isPageDesignerEntity(params.entity) && Boolean(tabsValue);

  if (shouldOpenDesigner && params.entity && tabsValue) {
    // Beautified URL is /admin/Entity?tabs=... — send it to the designer route.
    const tabs = String(tabsValue)
      .split(",")
      .map((tab) => {
        const [entity, key] = tab.split(":");
        return entity && key ? { entity, key } : null;
      })
      .filter((tab): tab is { entity: string; key: string } => Boolean(tab));

    return (
      <Navigate href={buildPageDesignerUrl(params.entity, tabs)} replace />
    );
  }

  return (
    <>
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
