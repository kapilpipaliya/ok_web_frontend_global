// This function will call multiple times, but it is optimized to not delete existing edges and use existing edges.
import { getNewGraphId, GraphInterface, Vertex } from "~/lib/graph/graph";
import { addNewEdge, deleteEdge, newEdge } from "~/lib/graph/mutate/Edge";
import { SetStoreFunction, Store } from "solid-js/store";
import { getToEdge } from "~/lib/graph/get/sync/getToEdge";

export function setSelectionValue(
  txnId: number,
  vertex: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  meta: Vertex,
  value?: number[] | number,
) {
  // delete removed edges:
  const type = getToEdge(meta, vertex);
  const previousEdges = vertex.OUT[type] || [];

  if (!Array.isArray(value)) {
    if (value !== null && value !== undefined) {
      value = [value];
    } else {
      value = [];
    }
  }

  for (const edgeId of previousEdges) {
    // we should not delete edge that end to same vertex
    if (value.includes(graph.edges[edgeId].E)) continue;
    const deleteEdgeResult = deleteEdge(txnId, edgeId, graph, setGraph);
    if (deleteEdgeResult?.error) alert(deleteEdgeResult.error);
  }

  // add added edges:
  for (const vertexId of value) {
    if (vertexOutEdgeContainVertex(vertex, type, vertexId, graph)) {
      continue;
    }
    const insertEdgeResult = addNewEdge(
      txnId,
      newEdge(getNewGraphId(), type, {}, vertex.id, vertexId),
      graph,
      setGraph,
    );
    if (insertEdgeResult.error) alert(insertEdgeResult.error);
  }
}

function vertexOutEdgeContainVertex(
  vertex: Vertex,
  type: string,
  vertexId: number,
  graph: Store<GraphInterface>,
) {
  const outEdges = vertex.OUT[type] || [];
  let containsVertexId = false;

  for (const edgeId of outEdges) {
    const endVertex = graph.edges[edgeId].E;
    if (endVertex === vertexId) {
      containsVertexId = true;
      break;
    }
  }
  return containsVertexId;
}
