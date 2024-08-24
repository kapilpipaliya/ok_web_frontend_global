import type { Transaction } from "neo4j-driver";

import type { Vertex } from "~/lib/graph/graph";

export async function handleInsert(
  insert: Vertex | Vertex[],
  tx: Transaction,
  clientToServerVertexIdMap: Map<string, string>,
  txnResult: { insert: [string, string] }[],
) {
  const labels = (Array.isArray(insert) ? insert[0].L : insert.L)
    .map((label: string) => `:${label}`)
    .join("");
  const query = `UNWIND $props AS props CREATE (n${labels}) SET n = props, n.createdAt = localDateTime() RETURN n`;

  try {
    const result = await tx.run(query, {
      props: Array.isArray(insert)
        ? insert.map((vertex) => vertex.P)
        : [insert.P],
    });
    if (result.records.length > 0) {
      result.records.forEach((record, index) => {
        const id = record.get("n").elementId;
        const oldId = Array.isArray(insert) ? insert[index].id : insert.id;
        clientToServerVertexIdMap.set(oldId, id);
        // can also send new vertex array to clients
        txnResult.push({ insert: [oldId, id] });
      });
    }
  } catch (error) {
    throw new Error(
      `Can't insert due to an internal server error: ${(error as Error).message}`,
    );
  }
}
