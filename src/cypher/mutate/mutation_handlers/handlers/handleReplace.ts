import { int } from "neo4j-driver";

export async function handleReplace(
  replace: any,
  tx: any,
  clientToServerVertexIdMap: Map<number, number>,
  txnResult: any[],
) {
  let id = replace.id;
  if (clientToServerVertexIdMap.has(id)) {
    id = clientToServerVertexIdMap.get(id);
  }

  const query =
    "MATCH (n) WHERE elementId(n) = $id SET n = $properties SET n.updatedAt = localDateTime() RETURN n";
  try {
    const result = await tx.run(query, { id: id, properties: replace.P });
    if (result.records.length > 0) {
      txnResult.push({ replace: { error: false, id } });
    }
  } catch (error: any) {
    throw new Error(
      `Can't replace due to an internal server error: ${error.message}`,
    );
  }
}
