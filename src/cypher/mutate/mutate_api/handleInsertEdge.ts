import type { TransactionPromise } from "neo4j-driver-core";

import { int } from "neo4j-driver";

export async function handleInsertEdge(
  insertEdge: any,
  tx: TransactionPromise,
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
  const query = `match (n1) where id(n1)=$startId
                match (n2) where id(n2)=$endId
                merge (n1)-[r:${type}]->(n2)
                SET r += $properties
                SET r.updatedAt = localDateTime()
                return r`;

  try {
    const result = await tx.run(query, {
      endId: int(endId),
      properties: insertEdge.P,
      startId: int(startId),
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
