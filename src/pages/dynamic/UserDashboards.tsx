import { A } from "@solidjs/router";
import { For, useContext } from "solid-js";
import { GraphContext, IdAttr } from "~/lib/graph/graph";
import { APP_BASE_URL } from "~/lib/Utils";


export function UserDashboards() {
  const [graph, setGraph] = useContext(GraphContext)!;
  const vertexes = () => graph.vertexLabelIdMap["Dashboard"] || [];
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
