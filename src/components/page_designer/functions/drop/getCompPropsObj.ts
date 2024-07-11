import type { Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";

export function getCompPropsObj(
  graph: Store<GraphInterface>,
  componentVertex: Vertex,
) {
  const propVertexes = getSelectionOptions(graph, () => 0, "->$0Prop", [
    componentVertex,
  ]);
  if (propVertexes.vertexes) {
    const initialValues = propVertexes.vertexes.reduce(
      (acc, curr) => {
        if (typeof curr.P.value === "boolean") {
          acc[curr.P.name] = curr.P.value;
        } else if (curr.P.value) {
          acc[curr.P.name] = curr.P.value;
        }
        return acc;
      },
      {} as { [key: string]: any },
    );
    return initialValues;
  }
}
