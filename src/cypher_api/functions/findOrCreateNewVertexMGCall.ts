import { DBConnection } from "~/cypher_api/functions/dbs";
import { findVertexMGCall } from "~/cypher_api/functions/findVertex";
import { newVertexDBCall } from "~/cypher_api/functions/newVertex";


export async function findOrCreateNewVertexMGCall(
  dbConn: DBConnection,
  label: string,
  lookupId: string,
  lookUpUniqueValue: string
) {
  if (!lookUpUniqueValue) {
    console.error("lookup Unique Value must not be empty");
    return;
  }
  const existingVertex = await findVertexMGCall(
    dbConn,
    label,
    lookupId,
    lookUpUniqueValue
  );

  if (existingVertex.error) {
    const newVertexResult = await newVertexDBCall(dbConn, label, {
      [lookupId]: lookUpUniqueValue,
    });
    return newVertexResult.vertex!;
  }
  return existingVertex.vertex!;
}
