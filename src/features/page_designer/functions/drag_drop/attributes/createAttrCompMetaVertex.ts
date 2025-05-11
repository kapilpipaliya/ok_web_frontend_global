import type { SetStoreFunction } from "solid-js/store";

import { generateNewVertexId } from "~/lib/graph/mutate/core/generateNewVertexId";

import { newVertex } from "~/lib/graph/mutate/core/vertex/newVertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

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
