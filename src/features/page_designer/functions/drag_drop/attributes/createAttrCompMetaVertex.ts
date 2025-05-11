import type { SetStoreFunction } from "solid-js/store";

import type { GraphInterface } from "~/lib/graph/GraphContext";

import { generateNewVertexId } from "~/lib/graph/mutate/core/generateNewVertexId";

import { newVertex } from "~/lib/graph/mutate/core/vertex/newVertex";

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
