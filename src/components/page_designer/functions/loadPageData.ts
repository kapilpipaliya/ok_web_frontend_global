import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { getDataMGCall } from "~/cypher/get/getDataMGCall";
import { getEdgesFromRowsAttr } from "~/lib/getEdgesFromRowsAttr";

import { FormMetaData } from "../../../lib/meta/formMetaData";
import { FormMetaDataAuth } from "~/lib/FormMetaDataAuth.1";
import { setGraphData } from "../../../lib/websocket/setGraphData";

export async function loadPageData(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  fromVertex: Vertex,
  showErrorToast: any,
) {
  const form =
    FormMetaData[fromVertex.L[0]] || FormMetaDataAuth[fromVertex.L[0]];
  if (!form) {
    showErrorToast("Form not found");
    return;
  }
  const { incoming, outgoing } = getEdgesFromRowsAttr(form.attributes);
  const result = await getDataMGCall({
    expression: `id:'${fromVertex.id}'`,
    incoming,
    outgoing,
  });

  setGraphData(graph, setGraph, result.graph);
}
