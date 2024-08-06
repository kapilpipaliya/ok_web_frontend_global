import { A } from "@solidjs/router";
import { For } from "solid-js";

import { IdAttr, useGraph } from "~/lib/graph/graph";

export function AllForms() {
  const [graph, _setGraph] = useGraph();
  // TODO: get all forms from the server
  const allForms = () => graph.vertexLabelIdMap.Form || [];

  return (
    <div class="">
      <For each={allForms()}>
        {(vertexId) => (
          <A href={`${graph.APP_BASE_URL}/${graph.vertexes[vertexId].P[IdAttr]}/new`}>
            {graph.vertexes[vertexId].P[IdAttr]}
          </A>
        )}
      </For>
    </div>
  );
}
