import type { SetStoreFunction, Store } from "solid-js/store";

import type { Vertex } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

import { fetchDataFromDB } from "~/cypher/get/fetchDataFromDB";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/edge/getEdgesFromRowsAttr";
import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import { FormMetaData } from "~/lib/meta/formMetaData";

export async function loadPageData(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  fromVertex: Vertex,
  showErrorToast: any,
) {
  const form = FormMetaData[fromVertex.L[0]];
  if (!form) {
    showErrorToast("Form not found");
    return;
  }
  const { incoming, outgoing } = getEdgesFromRowsAttr(form.attributes);
  const result = await fetchDataFromDB({
    expression: `id:'${fromVertex.id}'`,
    [getGlobalStore(graph).P.url]: true,
    incoming,
    outgoing,
  });

  setGraphData(graph, setGraph, result.graph);
}
