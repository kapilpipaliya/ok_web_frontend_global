import {newVertex} from "~/lib/graph/mutate/vertex";
import {getNewGraphId} from "~/lib/graph/transaction";

export function createAttrCollMetaVertex() {
  return newVertex(getNewGraphId(), [], {
    name: "coll",
    displayName: "Collection",
    component: "SelectBox",

    collection: "g:'Coll'",
    parentLabel: "Coll",

  });
}