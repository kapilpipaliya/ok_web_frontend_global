import { batch } from "solid-js";
import { ServerEventsDispatcher } from "~/lib/websocket/ws_events_dispatcher";
import { deleteEdge } from "~/lib/graph/mutate/edge";
import { deleteVertex } from "~/lib/graph/mutate/vertex";
import { GraphInterface, Vertex } from "~/lib/graph/graph";
import { commitTxn, getNewTxnId } from "../transaction";
import { SetStoreFunction, Store } from "solid-js/store";
import { useToast } from "~/components/custom/Toast";

export function deleteRow(
  vertex: Vertex,
  isRealTime: boolean,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  Ws: ServerEventsDispatcher,
) {
  const { showErrorToast } = useToast();

  batch(() => {
    if (isRealTime) {
      txnId = getNewTxnId(graph, setGraph);
    }
    // delete all vertex in edges
    const inEdges = vertex.IN;
    for (const type in inEdges) {
      for (const edgeId of inEdges[type]) {
        const deleteEdgeResult = deleteEdge(txnId, edgeId, graph, setGraph);
        if (deleteEdgeResult?.error)
          showErrorToast(deleteEdgeResult.error.toString());
      }
    }
    // delete all outEdges of vertex
    const outEdge = vertex.OUT;
    for (const type in outEdge) {
      for (const edgeId of outEdge[type]) {
        const deleteEdgeResult = deleteEdge(txnId, edgeId, graph, setGraph);
        if (deleteEdgeResult?.error)
          showErrorToast(deleteEdgeResult.error.toString());
      }
    }

    // delete vertex:
    const deleteResult = deleteVertex(txnId, vertex.id, graph, setGraph);
    if (deleteResult.error) showErrorToast(deleteResult.error.toString());
    if (isRealTime) commitTxn(txnId, Ws);
  });
}
