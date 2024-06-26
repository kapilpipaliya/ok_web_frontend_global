import type {Vertex} from "~/lib/graph/graph";
import {IdAttr} from "~/lib/graph/graph";
import {findVertexByLabelAndUniqueId} from "~/lib/graph/get/sync/findVertex";
import {componentDrop} from "~/lib/drag_drop/drop/componentDrop";

export function addFormComponentAttr(graph, dataVertex: Vertex, txnId: number, setGraph) {
  // add form component
  const formCompVertex = findVertexByLabelAndUniqueId(
    graph,
    "Comp",
    IdAttr,
    "Form",
  );
  return componentDrop(
    dataVertex,
    txnId,
    formCompVertex!,
    dataVertex!,
    graph,
    setGraph,
  );
}