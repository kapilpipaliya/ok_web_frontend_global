import { int } from "neo4j-driver";


export async function handleReplaceEdgeEnd(replaceEdgeEnd: any, tx: any, clientToServerVertexIdMap: Map<number, number>, clientToServerEdgeIdMap: Map<number, number>, txnResult: any[]) {
  const id = clientToServerEdgeIdMap.get(replaceEdgeEnd.id) || replaceEdgeEnd.id;
  const startId = clientToServerVertexIdMap.get(replaceEdgeEnd.S) || replaceEdgeEnd.S;
  const endId = clientToServerVertexIdMap.get(replaceEdgeEnd.E) || replaceEdgeEnd.E;
  const type = replaceEdgeEnd.T;
  const query = `match ()-[r:${type}]->()
                WHERE id(r) = $edgeId
                match (s) where id(s) = id(startNode(r)) 
                match (e) where id(e) = $newend 
                create (s)-[t:${type}]->(e)
                set t = properties(r)
                SET t.updatedAt = localDateTime()
                delete r
                return t`;

  try {
    const result = await tx.run(query, {
      edgeId: int(id),
      newend: int(endId),
    });
    if (result.records.length > 0) {
      const oldId = replaceEdgeEnd.id;
      const edgeId = result.records[0].get("r").elementId;
      clientToServerEdgeIdMap.set(oldId, edgeId);
      txnResult.push({ replaceEdgeEnd: { error: false } });
    }
  } catch (error) {
    tx.rollback();
    console.error("Failed to execute replace edge end query:", error);
    throw new Error(`Can't replace edge end due to an internal server error: ${error}`);
  }
}
