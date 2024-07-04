import type { SetStoreFunction, Store } from "solid-js/store";

import type {GraphInterface, Vertex} from "~/lib/graph/graph";

import {componentDrop} from "~/lib/drag_drop/drop/componentDrop";
import {findVertexByLabelAndUniqueId} from "~/lib/graph/get/sync/findVertex";
import { IdAttr } from "~/lib/graph/graph";

export function addFormComponentAttr(
  dataVertex: Vertex,
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
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