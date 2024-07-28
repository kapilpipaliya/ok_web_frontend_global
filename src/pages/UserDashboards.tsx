import { A } from "@solidjs/router";
import { For } from "solid-js";

import { IdAttr, useGraph } from "~/lib/graph/graph";

export function UserDashboards() {
  const [graph] = useGraph();
  const vertexes = () => graph.vertexLabelIdMap.Dashboard || [];
  return (
    <div class="">
      <For each={vertexes()}>
        {(vertexId) => (
          <A
            href={`${graph.APP_BASE_URL}/grid/${graph.vertexes[vertexId].P[IdAttr]}`}
          >
            {graph.vertexes[vertexId].P[IdAttr]}
          </A>
        )}
      </For>
    </div>
  );
}
