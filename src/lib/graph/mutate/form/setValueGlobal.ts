import {
  type GraphInterface, IdAttr,
  type Vertex
} from "~/lib/graph/graph";
import { commitTxn, getNewTxnId } from "../../transaction";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import type { SetStoreFunction, Store } from "solid-js/store";
import type { ServerEventsDispatcher } from "~/lib/websocket/ws_events_dispatcher";
import { onChangeHandler } from "./onChangeHandler";


export function setValueGlobal(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  attribute: Vertex,
  vertex: Vertex,
  data: any,
  ws: ServerEventsDispatcher,
  isRealTime: boolean
) {
  if (!vertex) {
    return;
  }

  // after commit, we can not use same txnId();
  if (isRealTime) {
    txnId = getNewTxnId(graph, setGraph);
  }

  mergeVertexProperties(txnId, vertex.id, graph, setGraph, {
    [attribute.P[IdAttr]]: data,
  });

  // we directly save the dataType on vertex:
  // @ts-ignore
  setGraph("vertexes", vertex.id, "D", {
    [attribute.P[IdAttr]]: attribute.P.dataType,
  });

  onChangeHandler(txnId, vertex, vertex, attribute, graph, setGraph);
  if (isRealTime) commitTxn(txnId, ws);
}
