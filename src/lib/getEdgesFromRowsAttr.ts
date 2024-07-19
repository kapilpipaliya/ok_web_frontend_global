import type { NestedExpression } from "~/cypher/get/NestedExpression";
import type { Vertex } from "~/lib/graph/graph";

import { FieldAttribute } from "./FormMetadataType";
import { getInEdge } from "./graph/get/sync/getInEdge";
import { getToEdge } from "./graph/get/sync/getToEdge";

export function getEdgesFromRowsAttr(
  metaAttrs: FieldAttribute[],
  ignoreTables: boolean = false,
): {
  incoming: NestedExpression[];
  outgoing: NestedExpression[];
} {
  const outgoing = [] as NestedExpression[];
  const incoming = [] as NestedExpression[];

  for (const attribute of metaAttrs) {
    if (
      attribute.componentName === "SelectBox" ||
      attribute.componentName === "TagBox"
    ) {
      if (attribute.inward) {
        incoming.push({
          expression: `<-${getInEdge(
            { P: attribute } as unknown as Vertex,
            { L: ["$0"] } as unknown as Vertex,
          )}`,
        }); // `<-${capitalizedName}$0`
      } else {
        outgoing.push({
          expression: `->${getToEdge(
            { P: attribute } as unknown as Vertex,
            { L: ["$0"] } as unknown as Vertex,
          )}`,
        }); // `->$0${capitalizedName}`
      }
    } else if (
      !ignoreTables &&
      (attribute.componentName === "Table" ||
        attribute.componentName === "DynamicTable")
    ) {
      const expression: NestedExpression = {
        expression: `->${getToEdge(
          { P: attribute } as unknown as Vertex,
          { L: ["$0"] } as unknown as Vertex,
        )}`,
      };

      if (attribute.attributes) {
        const nested = getEdgesFromRowsAttr(attribute.attributes);
        expression.incoming = nested.incoming;
        expression.outgoing = nested.outgoing;
      }
      outgoing.push(expression);
    }
  }

  return { incoming, outgoing };
}
