import { A, useParams } from "@solidjs/router";
import { For, useContext } from "solid-js";
import { GraphContext, IdAttr } from "~/lib/graph/graph";
import { APP_BASE_URL } from "~/lib/Utils";
import { getChildVertexes } from "~/lib/graph/get/sync/traverse";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";

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
    getChildVertexes(graph, ["$0Form"], [dashboard]).vertexes || [];
  const allCollTableLayouts =
    getChildVertexes(graph, ["$0Coll"], [dashboard]).vertexes || [];

  const allTableLayouts = () => [
    ...new Set([...allCollTableLayouts, ...allFormTableLayouts]),
  ];
  return (
    <div class="grid-cols:2 grid-cols:3@xs grid-cols:4@sm grid-cols:5@md gap:15 gap:20@sm">
      <For each={allTableLayouts()}>
        {(tableLayout) => (
          <div class="bg:gray-5 box-shadow:1|1|1|1|gray-20 pb:50 pt:50 r:7|7|7|7 r:10 flex">
            <h3 class="f:18@md font:semibold"></h3>
            <p class="mt:5 mb:0 mx:auto f:18@md font:semibold">
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
