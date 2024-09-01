import type { Store } from "solid-js/store";

import type { GraphInterface } from "~/lib/graph/graph";

import { newVertex } from "~/lib/graph/mutate/vertex";

export function createAttrMetaVertex(graph: Store<GraphInterface>) {
  return newVertex(graph.newVertexId, [], {
    componentName: "Table",
    key: "Attr",
    label: "Attr",

    tab: "Attribute",
    type: "Attr",
  });
}
