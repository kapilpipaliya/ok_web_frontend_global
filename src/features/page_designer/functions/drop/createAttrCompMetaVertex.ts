import type { SetStoreFunction } from "solid-js/store";

import type { GraphInterface } from "~/lib/graph/graph";

import { newVertex } from "~/lib/graph/mutate/core/vertex";
import { generateNewVertexId } from "~/lib/graph/transaction/core/generateNewVertexId";

export function createAttrCompMetaVertex(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  return newVertex(generateNewVertexId(graph, setGraph), [], {
    collection: "g:'Comp'",
    componentName: "Select",

    key: "Comp",
  });
}
