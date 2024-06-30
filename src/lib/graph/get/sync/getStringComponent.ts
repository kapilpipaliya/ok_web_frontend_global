import { getChildVertex } from "./traverse";
import type { Store } from "solid-js/store";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";


export function getStringComponent(
  graph: Store<GraphInterface>,
  attrDataTypeVertex?: Vertex
) {
  if (!attrDataTypeVertex) {
    attrDataTypeVertex = findVertexByLabelAndUniqueId(
      graph,
      "DataType",
      "name",
      "String"
    );
    if (!attrDataTypeVertex) {
      return;
    }
  }
  return getChildVertex(graph, ["$0Default"], attrDataTypeVertex).vertex;
}
