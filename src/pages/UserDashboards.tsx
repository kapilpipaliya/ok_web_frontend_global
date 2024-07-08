import { A } from "@solidjs/router";
import { For } from "solid-js";

import { APP_BASE_URL } from "~/lib/constants";
import { IdAttr, useGraph } from "~/lib/graph/graph";

export function UserDashboards() {
  const [graph, setGraph] = useGraph();
  const vertexes = () => graph.vertexLabelIdMap.Dashboard || [];
  return (
    <div class="">
      <For each={vertexes()}>
        {(vertexId) => (
          <A
            href={`${APP_BASE_URL}/grid/${graph.vertexes[vertexId].P[IdAttr]}`}
          >
            {graph.vertexes[vertexId].P[IdAttr]}
          </A>
        )}
      </For>
    </div>
  );
}
