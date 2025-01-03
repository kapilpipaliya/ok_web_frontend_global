import type { GraphInterface } from "~/lib/graph/graph";

import { newVertex } from "~/lib/graph/mutate/vertex";

export function createAttrCompMetaVertex(graph: GraphInterface) {
  return newVertex(graph.newVertexId(), [], {
    collection: "g:'Comp'",
    componentName: "Select",

    key: "Comp",
  });
}
