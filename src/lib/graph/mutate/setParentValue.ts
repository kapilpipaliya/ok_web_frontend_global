import type { SetStoreFunction, Store } from "solid-js/store";
import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";
import { useToast } from "~/components/custom/Toast";
import { getInEdge } from "~/lib/graph/get/sync/traverse";
import { addNewEdge, deleteEdge, newEdge } from "~/lib/graph/mutate/edge";
import { getNewGraphId } from "~/lib/graph/transaction";

// This function will call multiple times, but it is optimized to not delete existing edges and use existing edges.
export function setParentValue(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  vertex: Vertex,
  meta: Vertex,
  value?: Id[] | Id,
) {
  const { showWarningToast, showErrorToast } = useToast();

  // delete removed edges:
  const type = getInEdge(meta, vertex);
  if (!type) showWarningToast("edge type cant be empty");
  const previousEdges = vertex.IN[type] || [];

  let valueArray = [] as Id[];

  if (!Array.isArray(value)) {
    if (value !== null && value !== undefined) {
      valueArray = [value];
    } else {
      valueArray = [];
    }
  } else {
    valueArray = value;
  }

  for (const edgeId of previousEdges) {
    // we should not delete edge that start with same vertex
    if (valueArray.includes(graph.edges[edgeId].S)) continue;
    const deleteEdgeResult = deleteEdge(txnId, edgeId, graph, setGraph);
    if (deleteEdgeResult?.error)
      showErrorToast(deleteEdgeResult.error.toString());
  }

  // add added edges:
  for (const vertexId of valueArray) {
    if (vertexInEdgeContainVertex(vertex, type, vertexId, graph)) {
      continue;
    }

    const insertEdgeResult = addNewEdge(
      txnId,
      newEdge(getNewGraphId(), type, {}, vertexId, vertex.id),
      graph,
      setGraph,
    );
    if (insertEdgeResult.error)
      showErrorToast(insertEdgeResult.error.toString());
  }
}
function vertexInEdgeContainVertex(
  vertex: Vertex,
  type: any,
  vertexId: Id,
  graph: Store<GraphInterface>,
) {
  const inEdges = vertex.IN[type] || [];
  let includesVertexId = false;
  for (const edgeId of inEdges) {
    const startVertex = graph.edges[edgeId].S;
    if (startVertex === vertexId) {
      includesVertexId = true;
      break;
    }
  }
  return includesVertexId;
}
