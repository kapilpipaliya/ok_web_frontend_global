import type { SetStoreFunction, Store } from "solid-js/store";

import { fetchDataFromDB } from "~/cypher/get/fetchDataFromDB";
import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import { FormMetaData } from "~/lib/meta/formMetaData";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export async function loadPageData(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  fromVertex: Vertex,
  showErrorToast: any,
) {
  const formKey = fromVertex.L[0];
  if (!FormMetaData[formKey]) {
    showErrorToast("Page not found");
    return;
  }

  const result = await fetchDataFromDB({
    expression: `id:'${fromVertex.id}'`,
    [getGlobalStore(graph).P.url]: true,
    formKey,
  });

  setGraphData(graph, setGraph, result.graph);
}
