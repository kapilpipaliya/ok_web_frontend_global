

export async function handleDeleteEdge(
  deleteEdge: any,
  tx: any,
  clientToServerVertexIdMap: Map<number, number>,
  clientToServerEdgeIdMap: Map<number, number>,
  txnResult: any[],
) {
  const id = clientToServerEdgeIdMap.get(deleteEdge.id) || deleteEdge.id;
  const startId = clientToServerVertexIdMap.get(deleteEdge.S) || deleteEdge.S;
  const endId = clientToServerVertexIdMap.get(deleteEdge.E) || deleteEdge.E;
  const type = deleteEdge.T;
  const query = `match (n1)-[r:${type}]->(n2)
                where elementId(n1) = $startId and elementId(n2) = $endId and elementId(r) = $id 
                delete r;`;

  try {
    const result = await tx.run(query, {
      endId: endId,
      id: id,
      startId: startId,
    });
    if (result.records.length > 0) {
      const oldId = deleteEdge.id;
      const edgeId = result.records[0].get("r").elementId;
      clientToServerEdgeIdMap.set(oldId, edgeId);
      txnResult.push({ deleteEdge: { error: false } });
    }
  } catch (error: any) {
    throw new Error(
      `Can't delete edge due to an internal server error: ${error.message}`,
    );
  }
}
