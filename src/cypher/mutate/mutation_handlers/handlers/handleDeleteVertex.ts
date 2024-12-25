import { int } from "neo4j-driver";

export async function handleDeleteVertex(
  deleteVertex: any,
  tx: any,
  clientToServerVertexIdMap: Map<number, number>,
  txnResult: any[],
) {
  const id = clientToServerVertexIdMap.get(deleteVertex.id) || deleteVertex.id;
  const query = "MATCH (n) WHERE elementId(n) = $id DELETE n";

  try {
    await tx.run(query, { id: id });
    txnResult.push({ deleteVertex: { error: false, id } });
  } catch (error: any) {
    throw new Error(
      `Can't delete vertex due to an internal server error: ${error.message}`,
    );
  }
}
