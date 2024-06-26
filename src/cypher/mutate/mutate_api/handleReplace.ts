import { int } from "neo4j-driver";


export async function handleReplace(replace: any, tx: any, clientToServerVertexIdMap: Map<number, number>, txnResult: any[]) {
  let id = replace.id;
  if (clientToServerVertexIdMap.has(id)) {
    id = clientToServerVertexIdMap.get(id);
  }

  const query = "MATCH (n) WHERE id(n) = $id SET n = $properties SET n.updatedAt = localDateTime() RETURN n";
  try {
    const result = await tx.run(query, { id: int(id), properties: replace.P });
    if (result.records.length > 0) {
      txnResult.push({ replace: { id, error: false } });
    }
  } catch (error: any) {
    tx.rollback();
    console.error("Failed to execute replace query:", error);
    throw new Error(`Can't replace due to an internal server error: ${error.message}`);
  }
}
