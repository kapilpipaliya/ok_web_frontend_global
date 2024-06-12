import {newVertex} from "~/lib/graph/mutate/vertex";
import {getNewGraphId} from "~/lib/graph/transaction";

export function createAttrCompMetaVertex() {
  return newVertex(getNewGraphId(), [], {
    name: "Comp",
    component: "SelectBox",

    collection: "g:'Comp'",

  });
}