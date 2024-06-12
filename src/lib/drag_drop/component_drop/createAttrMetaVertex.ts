import {newVertex} from "~/lib/graph/mutate/vertex";
import {getNewGraphId} from "~/lib/graph/transaction";

export function createAttrMetaVertex() {
  return newVertex(getNewGraphId(), [], {
    name: "Attr",
    component: "Table",
    tab: "Attribute",

    type: "Attr",
    label: "Attr",

  });
}