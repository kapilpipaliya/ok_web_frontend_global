import type { Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { evalExpression } from "~/lib/expression_eval";



export function getCompPropsObj(
  graph: Store<GraphInterface>,
  componentVertex: Vertex,
) {
  const propVertexes = evalExpression("->$0Prop", {
    graph,
    vertexes: [componentVertex],
  });
  if (propVertexes) {
    const initialValues = propVertexes.reduce(
      (acc, curr) => {
        if (typeof curr.P.value === "boolean") {
          acc[curr.P.key] = curr.P.value;
        } else if (curr.P.value) {
          acc[curr.P.key] = curr.P.value;
        }
        return acc;
      },
      {} as { [key: string]: any },
    );
    return initialValues;
  }
}
