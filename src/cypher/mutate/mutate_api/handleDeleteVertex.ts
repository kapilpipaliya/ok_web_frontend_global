import { int } from "neo4j-driver";


export async function handleDeleteVertex(deleteVertex: any, tx: any, clientToServerVertexIdMap: Map<number, number>, txnResult: any[]) {
  const id = clientToServerVertexIdMap.get(deleteVertex.id) || deleteVertex.id;
  const query = "MATCH (n) WHERE id(n) = $id DELETE n";

  try {
    await tx.run(query, { id: int(id) });
    txnResult.push({ deleteVertex: { id, error: false } });
  } catch (error: any) {
    tx.rollback();
    console.error("Failed to execute delete vertex query:", error);
    throw new Error(`Can't delete vertex due to an internal server error: ${error.message}`);
  }
}
