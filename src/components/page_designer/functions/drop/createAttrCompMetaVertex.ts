import { newVertex } from "~/lib/graph/mutate/vertex";

export function createAttrCompMetaVertex(graph: GraphInterface) {
  return newVertex(graph.newVertexId, [], {
    collection: "g:'Comp'",
    component: "SelectBox",

    name: "Comp",
  });
}
