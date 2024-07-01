import {newVertex} from "~/lib/graph/mutate/vertex";
import {getNewGraphId} from "~/lib/graph/transaction";

export function createAttrCompMetaVertex() {
  return newVertex(getNewGraphId(), [], {
    collection: "g:'Comp'",
    component: "SelectBox",

    name: "Comp",

  });
}