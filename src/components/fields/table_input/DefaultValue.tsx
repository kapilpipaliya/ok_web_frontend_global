import { Show } from "solid-js";
import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import { type Vertex, useGraph } from "~/lib/graph/graph";

// Component to display the default value

export function DefaultValue(props: { joinVertex: Vertex; metaVertex: Vertex; }) {
  const [graph, setGraph] = useGraph();
  return (
    <Show when={props.metaVertex.P.defaultValue}>
      {getSelectionOptions(graph, setGraph, props.metaVertex.P.defaultValue, [props.joinVertex]).vertexes}
    </Show>
  );
}
