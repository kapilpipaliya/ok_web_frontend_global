import type { Transaction } from "neo4j-driver";

import type { Id, Vertex } from "~/lib/graph/graph";
export async function handleDeleteVertex(
  deleteVertex: Vertex,
  tx: Transaction,
  clientToServerVertexIdMap: Map<Id, Id>,
  txnResult: any[],
  deletedVertexes: Id[] = [],
) {
  const id = clientToServerVertexIdMap.get(deleteVertex.id) || deleteVertex.id;
  const query = "MATCH (n) WHERE elementId(n) = $id DELETE n";

  try {
    await tx.run(query, { id: id });
    deletedVertexes.push(id);
    txnResult.push({ deleteVertex: { error: false, id } });
  } catch (error: any) {
    throw new Error(
      `Can't delete vertex due to an internal server error: ${error.message}`,
    );
  }
}
