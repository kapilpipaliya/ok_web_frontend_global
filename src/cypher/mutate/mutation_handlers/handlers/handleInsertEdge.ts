import type { Transaction } from "neo4j-driver";

export async function handleInsertEdge(
  insertEdge: any,
  tx: Transaction,
  clientToServerVertexIdMap: Map<number, number>,
  clientToServerEdgeIdMap: Map<number, number>,
  txnResult: any[],
) {
  // if user has no permission to insert row vertex, do not allow and return error.
  // if user has no permission to insert select, dont allow it.
  //
  const startId = clientToServerVertexIdMap.get(insertEdge.S) || insertEdge.S;
  const endId = clientToServerVertexIdMap.get(insertEdge.E) || insertEdge.E;
  const type = insertEdge.T;
  const query = `match (n1) where elementId(n1)=$startId
                match (n2) where elementId(n2)=$endId
                merge (n1)-[r:${type}]->(n2)
                SET r += $properties
                SET r.updatedAt = localDateTime()
                return r`;

  try {
    const result = await tx.run(query, {
      endId: endId,
      properties: insertEdge.P,
      startId: startId,
    });
    if (result.records.length > 0) {
      const oldId = insertEdge.id;
      const edgeId = result.records[0].get("r").elementId;
      clientToServerEdgeIdMap.set(oldId, edgeId);
      txnResult.push({ insertEdge: [oldId, edgeId] });
    }
  } catch (error: any) {
    throw new Error(
      `Can't insert edge due to an internal server error: ${error.message}`,
    );
  }
}
