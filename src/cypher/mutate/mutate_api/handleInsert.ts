export async function handleInsert(
  insert: any,
  tx: any,
  clientToServerVertexIdMap: Map<number, number>,
  txnResult: any[],
) {
  const labels = insert.L.map((label: string) => `:${label}`).join("");
  const query = `CREATE (n${labels} $properties) SET n.createdAt = localDateTime() RETURN n`;

  try {
    const result = await tx.run(query, { properties: insert.P });
    if (result.records.length > 0) {
      const id = result.records[0].get("n").elementId;
      const oldId = insert.id;
      clientToServerVertexIdMap.set(oldId, id);
      txnResult.push({ insert: [oldId, id] });
    }
  } catch (error: any) {
    throw new Error(
      `Can't insert due to an internal server error: ${error.message}`,
    );
  }
}
