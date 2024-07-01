import { int } from "neo4j-driver";


export async function handleReplaceEdge(replaceEdge: any, tx: any, clientToServerVertexIdMap: Map<number, number>, clientToServerEdgeIdMap: Map<number, number>, txnResult: any[]) {
  const id = clientToServerEdgeIdMap.get(replaceEdge.id) || replaceEdge.id;
  const startId = clientToServerVertexIdMap.get(replaceEdge.S) || replaceEdge.S;
  const endId = clientToServerVertexIdMap.get(replaceEdge.E) || replaceEdge.E;
  const type = replaceEdge.T;
  const query = `match (n1) where id(n1)=$startId
                match (n2) where id(n2)=$endId
                match (n1)-[r:${type}]->(n2)
                where id(r) = $id
                set r = $properties
                SET r.updatedAt = localDateTime()
                return r`;

  try {
    const result = await tx.run(query, {
      endId: int(endId),
      id: int(id),
      properties: replaceEdge.P,
      startId: int(startId),
    });
    if (result.records.length > 0) {
      const oldId = replaceEdge.id;
      const edgeId = result.records[0].get("r").elementId;
      clientToServerEdgeIdMap.set(oldId, edgeId);
      txnResult.push({ replaceEdge: [oldId, edgeId] });
    }
  } catch (error: any) {
    throw new Error(`Can't replace edge due to an internal server error: ${error.message}`);
  }
}
