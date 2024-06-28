import { int } from "neo4j-driver";


export async function handleReplaceEdgeStart(replaceEdgeStart: any, tx: any, clientToServerVertexIdMap: Map<number, number>, clientToServerEdgeIdMap: Map<number, number>, txnResult: any[]) {
  const id = clientToServerEdgeIdMap.get(replaceEdgeStart.id) || replaceEdgeStart.id;
  const startId = clientToServerVertexIdMap.get(replaceEdgeStart.S) || replaceEdgeStart.S;
  const endId = clientToServerVertexIdMap.get(replaceEdgeStart.E) || replaceEdgeStart.E;
  const type = replaceEdgeStart.T;
  const query = `match ()-[r:${type}]->()
                WHERE id(r) = $edgeId 
                match (s) where id(s) = $newstart 
                match (e) where id(e) = id(endNode(r)) 
                create (s)-[t:${type}]->(e)
                set t = properties(r)
                SET t.updatedAt = localDateTime()
                delete r
                return t`;

  try {
    const result = await tx.run(query, {
      edgeId: int(id),
      newstart: int(startId),
    });
    if (result.records.length > 0) {
      const oldId = replaceEdgeStart.id;
      const edgeId = result.records[0].get("r").elementId;
      clientToServerEdgeIdMap.set(oldId, edgeId);
      txnResult.push({ replaceEdgeStart: { error: false } });
    }
  } catch (error) {
    throw new Error(`Can't replace edge start due to an internal server error: ${error}`);
  }
}
