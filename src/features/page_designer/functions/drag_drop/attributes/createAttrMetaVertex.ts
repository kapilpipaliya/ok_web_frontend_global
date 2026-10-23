import type { StoreSetter as SetStoreFunction, Store } from "solid-js";

import { generateNewVertexId } from "~/lib/graph/mutate/core/generateNewVertexId";

import { newVertex } from "~/lib/graph/mutate/core/vertex/newVertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function createAttrMetaVertex(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  return newVertex(generateNewVertexId(graph, setGraph), [], {
    componentName: "TableField",
    key: "Attr",
    label: "Attr",

    tab: "Attribute",
    type: "Attr",
  });
}
