import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { componentDrop } from "~/features/page_designer/functions/drop/componentDrop";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/entity/findVertex";
import { IdAttr } from "~/lib/graph/graph";

export function addComponentAttrInPage(
  formVertex: Vertex,
  dataVertex: Vertex,
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  componentName: string,
  properties: Record<string, any> = {},
) {
  const formCompVertex = findVertexByLabelAndUniqueId(
    graph,
    "Comp",
    IdAttr,
    componentName,
  );
  if (!formCompVertex) {
    return -1;
  }
  return componentDrop(
    formVertex,
    txnId,
    formCompVertex,
    dataVertex,
    graph,
    setGraph,
    undefined,
    properties,
  );
}
