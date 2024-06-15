import type {
  GraphInterface,
  Vertex
} from "~/lib/graph/graph";
import {
  commitTxn,
  getNewGraphId,
  getNewTxnId
} from "../../transaction";
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
import type { SetStoreFunction, Store } from "solid-js/store";
import type { ServerEventsDispatcher } from "~/lib/websocket/ws_events_dispatcher";


export function createForm(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  ws: ServerEventsDispatcher,
  label: string,
  properties?: {
    [key: string]: any;
  }
): {
  error: string | boolean;
  vertex?: Vertex;
} {
  if (!label) {
    return { error: "Label not found" };
  }

  const isRealTime = false;
  if (isRealTime) {
    txnId = getNewTxnId(graph, setGraph);
  }
  const newVertexObj = newVertex(getNewGraphId(), [label], properties || {});
  // TODO: Do Create Transformation for the vertex
  const addNewVertexResult = addNewVertex(txnId, newVertexObj, graph, setGraph);
  if (addNewVertexResult.error) {
    return addNewVertexResult;
  }
  if (isRealTime) commitTxn(txnId, ws);
  const vertex = graph.vertexes[newVertexObj.id];
  return {
    error: false,
    vertex: vertex,
  };
}
