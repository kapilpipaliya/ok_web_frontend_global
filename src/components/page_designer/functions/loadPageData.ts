import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/getEdgesFromRowsAttr";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";
import { FormMetaData } from "~/lib/meta/formMetaData";
import { FormMetaDataAuth } from "~/lib/meta/formMetaDataAuth";

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
  const result = await fetchDataFromMG({
    expression: `id:'${fromVertex.id}'`,
    incoming,
    outgoing,
  });

  setGraphData(graph, setGraph, result.graph);
}
