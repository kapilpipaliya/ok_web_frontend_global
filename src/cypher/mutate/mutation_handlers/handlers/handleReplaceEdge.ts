

export async function handleReplaceEdge(
  replaceEdge: any,
  tx: any,
  clientToServerVertexIdMap: Map<number, number>,
  clientToServerEdgeIdMap: Map<number, number>,
  txnResult: any[],
) {
  const id = clientToServerEdgeIdMap.get(replaceEdge.id) || replaceEdge.id;
  const startId = clientToServerVertexIdMap.get(replaceEdge.S) || replaceEdge.S;
  const endId = clientToServerVertexIdMap.get(replaceEdge.E) || replaceEdge.E;
  const type = replaceEdge.T;
  const query = `match (n1) where elementId(n1)=$startId
                match (n2) where elementId(n2)=$endId
                match (n1)-[r:${type}]->(n2)
                where elementId(r) = $id
                set r = $properties
                SET r.updatedAt = localDateTime()
                return r`;

  try {
    const result = await tx.run(query, {
      endId: endId,
      id: id,
      properties: replaceEdge.P,
      startId: startId,
    });
    if (result.records.length > 0) {
      const oldId = replaceEdge.id;
      const edgeId = result.records[0].get("r").elementId;
      clientToServerEdgeIdMap.set(oldId, edgeId);
      txnResult.push({ replaceEdge: [oldId, edgeId] });
    }
  } catch (error: any) {
    throw new Error(
      `Can't replace edge due to an internal server error: ${error.message}`,
    );
  }
}
