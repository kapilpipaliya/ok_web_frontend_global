import { int } from "neo4j-driver";

export async function handleMerge(
  merge: any,
  tx: any,
  clientToServerVertexIdMap: Map<number, number>,
  txnResult: any[],
) {
  let id = merge.id;
  if (clientToServerVertexIdMap.has(id)) {
    id = clientToServerVertexIdMap.get(id);
  }

  const query =
    "MATCH (n) WHERE elementId(n) = $id SET n += $properties, n.updatedAt = localDateTime() RETURN n";
  try {
    const result = await tx.run(query, { id: id, properties: merge.P });
    if (result.records.length > 0) {
      txnResult.push({ merge: { error: false, id } });
    } else {
      throw new Error(`Vertex with id ${id} not found.`);
    }
  } catch (error: any) {
    throw new Error(
      `Can't merge due to an internal server error: ${error.message}`,
    );
  }
}
