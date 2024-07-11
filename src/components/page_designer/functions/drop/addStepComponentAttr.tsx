import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { componentDrop } from "~/components/page_designer/functions/drop/componentDrop";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";
import { IdAttr } from "~/lib/graph/graph";

export function addStepComponentAttr(
  dataVertex: Vertex,
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  // add Step component
  const formCompVertex = findVertexByLabelAndUniqueId(
    graph,
    "Comp",
    IdAttr,
    "Step",
  );
  return componentDrop(
    dataVertex,
    txnId,
    formCompVertex!,
    dataVertex,
    graph,
    setGraph,
  );
}
