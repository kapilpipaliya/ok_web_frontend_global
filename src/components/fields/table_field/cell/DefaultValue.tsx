import { Show } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { evalExpression } from "~/lib/expression_eval";
import { useGraph } from "~/lib/graph/GraphContext";

// Component to display the default value

export function DefaultValue(
  props: Readonly<{ joinVertex: Vertex; metaVertex: Vertex }>,
) {
  const [graph, setGraph] = useGraph();
  return (
    <Show when={props.metaVertex.P.defaultValue}>
      {evalExpression(props.metaVertex.P.defaultValue, {
        graph,
        setGraph,
        vertexes: [props.joinVertex],
      })}
    </Show>
  );
}
