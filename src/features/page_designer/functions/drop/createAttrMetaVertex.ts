import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface } from "~/lib/graph/graph";

import { newVertex } from "~/lib/graph/mutate/core/vertex";
import { generateNewVertexId } from "~/lib/graph/transaction/core/generateNewVertexId";

export function createAttrMetaVertex(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  return newVertex(generateNewVertexId(graph, setGraph), [], {
    componentName: "Table",
    key: "Attr",
    label: "Attr",

    tab: "Attribute",
    type: "Attr",
  });
}
