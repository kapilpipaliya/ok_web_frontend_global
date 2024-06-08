import {For, useContext} from "solid-js";
import {GraphContext, IdAttr} from "~/lib/graph/graph";
import {A} from "@solidjs/router";
import {APP_BASE_URL} from "~/lib/constants";

export function AllForms() {
  const [graph, setGraph] = useContext(GraphContext)!;
  // TODO: get all forms from the server
  const allForms = () => graph.vertexLabelIdMap.Form || [];

  return (
    <div class="">
      <For each={allForms()}>
        {(vertexId) => (
          <A href={`${APP_BASE_URL}/${graph.vertexes[vertexId].P[IdAttr]}/new`}>
            {graph.vertexes[vertexId].P[IdAttr]}
          </A>
        )}
      </For>
    </div>
  );
}