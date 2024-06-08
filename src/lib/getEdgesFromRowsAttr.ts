import { Expression } from "jsep";
import { getInEdge, getToEdge } from "~/lib/graph/get/sync/traverse";
import { Vertex } from "~/lib/graph/graph";

export function getEdgesFromRowsAttr(attrs: any): {
 incoming: Expression[];
 outgoing: Expression[];
} {
 const outgoing = [] as Expression[];
 const incoming = [] as Expression[];

 for (const attribute of attrs) {
  if (
   attribute.component === "SelectBox" ||
   attribute.component === "TagBox"
  ) {
   if (attribute.props?.inward) {
    incoming.push({
     expression: `<-${getInEdge(
      { P: attribute } as Vertex,
      { L: ["$0"] } as Vertex
     )}`,
     type: ""
    }); // `<-${capitalizedName}$0`
   } else {
    outgoing.push({
     expression: `->${getToEdge(
      { P: attribute } as Vertex,
      { L: ["$0"] } as Vertex
     )}`,
     type: ""
    }); // `->$0${capitalizedName}`
   }
  } else if (
   attribute.component === "Table" ||
   attribute.component === "Table2"
  ) {
   const expression: Expression = {
    expression: `->${getToEdge(
     { P: attribute } as Vertex,
     { L: ["$0"] } as Vertex
    )}`,
    type: ""
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