// This function will call multiple times, but it is optimized to not delete existing edges and use existing edges.
import {getNewGraphId, graph, Vertex} from "../../lib/graph";
import { getToEdge } from "../../lib/CommonUtils/getToEdge";
import {addNewEdge, deleteEdge, newEdge} from "../../lib/Edge";

export function setSelectionValue(
    txnId: number,
    vertex: Vertex,
    meta: Vertex,
    value?: number[] | number
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
        const deleteEdgeResult = deleteEdge(txnId, edgeId);
        if (deleteEdgeResult?.error) alert(deleteEdgeResult.error);
    }

    // add added edges:
    for (const vertexId of value) {
        if (vertexOutEdgeContainVertex(vertex, type, vertexId)) {
            continue;
        }
        const insertEdgeResult = addNewEdge(
            txnId,
            newEdge(getNewGraphId(), type, {}, vertex.id, vertexId)
        );
        if (insertEdgeResult.error) alert(insertEdgeResult.error);
    }
}
function vertexOutEdgeContainVertex(
    vertex: Vertex,
    type: string,
    vertexId: number
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