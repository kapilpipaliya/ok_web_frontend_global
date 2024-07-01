import {newVertex} from "~/lib/graph/mutate/vertex";
import {getNewGraphId} from "~/lib/graph/transaction";

export function createAttrCollMetaVertex() {
  return newVertex(getNewGraphId(), [], {
    collection: "g:'Coll'",
    component: "SelectBox",
    displayName: "Collection",

    name: "coll",
    parentLabel: "Coll",

  });
}