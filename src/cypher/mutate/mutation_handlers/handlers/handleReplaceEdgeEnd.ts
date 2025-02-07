

export async function handleReplaceEdgeEnd(
  replaceEdgeEnd: any,
  tx: any,
  clientToServerVertexIdMap: Map<number, number>,
  clientToServerEdgeIdMap: Map<number, number>,
  txnResult: any[],
) {
  const id =
    clientToServerEdgeIdMap.get(replaceEdgeEnd.id) || replaceEdgeEnd.id;
  const _startId =
    clientToServerVertexIdMap.get(replaceEdgeEnd.S) || replaceEdgeEnd.S;
  const endId =
    clientToServerVertexIdMap.get(replaceEdgeEnd.E) || replaceEdgeEnd.E;
  const type = replaceEdgeEnd.T;
  const query = `match ()-[r:${type}]->()
                WHERE elementId(r) = $edgeId
                match (s) where elementId(s) = elementId(startNode(r)) 
                match (e) where elementId(e) = $newend 
                create (s)-[t:${type}]->(e)
                set t = properties(r)
                SET t.updatedAt = localDateTime()
                delete r
                return t`;

  try {
    const result = await tx.run(query, {
      edgeId: id,
      newend: endId,
    });
    if (result.records.length > 0) {
      const oldId = replaceEdgeEnd.id;
      const edgeId = result.records[0].get("r").elementId;
      clientToServerEdgeIdMap.set(oldId, edgeId);
      txnResult.push({ replaceEdgeEnd: { error: false } });
    }
  } catch (error) {
    throw new Error(
      `Can't replace edge end due to an internal server error: ${error}`,
    );
  }
}
