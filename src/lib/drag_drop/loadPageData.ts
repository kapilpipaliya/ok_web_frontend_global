import type { SetStoreFunction, Store } from "solid-js/store";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import { setGraphData } from "../websocket/setGraphData";
import { getEdgesFromRowsAttr } from "~/lib/getEdgesFromRowsAttr";
import {getDataMGCall} from "~/cypher/get/getDataMGCall";
import {getFormMetaDataAsync} from "~/lib/graph/get/async/getFormMetaDataAsync";

export async function loadPageData(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  fromVertex: Vertex,
  showErrorToast: any,
) {
  const form: any = await getFormMetaDataAsync(
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

  setGraphData(graph, setGraph, result.graph);
}
