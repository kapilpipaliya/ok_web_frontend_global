import type { SetStoreFunction, Store } from "solid-js/store";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import { getFormMetaDataAsync } from "~/lib/graph/get/async/graph_functions";
import { getDataMGCall } from "~/cypher/get/traverse";
import { setGraphData } from "~/lib/websocket/ws_events";
import { getEdgesFromRowsAttr } from "~/lib/getEdgesFromRowsAttr";

export async function loadPageData(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  fromVertex: Vertex,
  showErrorToast: any,
) {
  const form: any = await getFormMetaDataAsync(
    graph,
    setGraph,
    fromVertex.L[0],
  );
  if (form.error) {
    showErrorToast(form.error);
    return;
  }
  const { incoming, outgoing }: { incoming: any; outgoing: any } =
    getEdgesFromRowsAttr(form.form.attributes);
  const result = await getDataMGCall({
    expression: `id:'${fromVertex.id}'`,
    incoming,
    outgoing,
  });

  if (result.error) {
    showErrorToast(result.error);
    return;
  }

  setGraphData(graph, setGraph, result.graph);
}
