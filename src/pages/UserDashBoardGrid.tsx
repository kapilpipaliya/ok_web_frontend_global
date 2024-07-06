import { A, useParams } from "@solidjs/router";
import { For, useContext } from "solid-js";

import { APP_BASE_URL } from "~/lib/constants";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";
import { getSelectionOptions } from "~/lib/graph/get/sync/traverse";
import { GraphContext, IdAttr } from "~/lib/graph/graph";

export function UserDashBoardGrid() {
  const params = useParams();
  const [graph, setGraph] = useContext(GraphContext)!;
  const dashboard = findVertexByLabelAndUniqueId(
    graph,
    "Dashboard",
    IdAttr,
    params.name,
  );
  if (!dashboard) {
    return "No Dashboard Found";
  }
  const allFormTableLayouts =
    getSelectionOptions(graph, () => 0, "->$0Form", [dashboard]).vertexes || [];

  const allTableLayouts = () => [
    ...new Set([...allFormTableLayouts]),
  ];
  return (
    <div class="gap:15 gap:20@sm grid-cols:2 grid-cols:3@xs grid-cols:4@sm grid-cols:5@md">
      <For each={allTableLayouts()}>
        {(tableLayout) => (
          <div class="flex bg:gray-5 box-shadow:1|1|1|1|gray-20 pb:50 pt:50 r:10">
            <h3 class="f:18@md font:semibold" />
            <p class="f:18@md font:semibold mb:0 mt:5 mx:auto">
              <A href={`${APP_BASE_URL}/${tableLayout.P[IdAttr]}`}>
                {tableLayout.P.title || tableLayout.P[IdAttr]}
              </A>
            </p>
          </div>
        )}
      </For>
    </div>
  );
}
