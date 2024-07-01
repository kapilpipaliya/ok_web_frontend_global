import {newVertex} from "~/lib/graph/mutate/vertex";
import {getNewGraphId} from "~/lib/graph/transaction";

export function createAttrMetaVertex() {
  return newVertex(getNewGraphId(), [], {
    component: "Table",
    label: "Attr",
    name: "Attr",

    tab: "Attribute",
    type: "Attr",

  });
}