import {  findVertexesMGCall } from "~/cypher_api/functions/findVertex";
import { newVertexDBCall } from "~/cypher_api/functions/newVertex";

export async function findOrCreateNewVertexMGCall(
  label: string,
  lookupId: string,
  lookUpUniqueValue: string,
) {
  if (!lookUpUniqueValue) {
    console.error("lookup Unique Value must not be empty");
    return;
  }
  const existingVertex = await findVertexesMGCall(
    {
      label: label,
      attribute: lookupId,
      value: lookUpUniqueValue,
    },
  );

  if (existingVertex.error) {
    const newVertexResult = await newVertexDBCall(label, {
      [lookupId]: lookUpUniqueValue,
    });
    return newVertexResult.vertex!;
  }
  return existingVertex.vertexes!;
}
