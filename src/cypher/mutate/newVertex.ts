import { getRequestURL } from "vinxi/http";

import { getDriver } from "~/cypher/driver";
import { convertNodeToJson } from "~/lib/convertNodeToJson";
import { getSubDomain } from "~/server/getSubDomain";

export async function newVertexDBCall(
  label: string,
  properties: { [key: string]: any } = {}
): Promise<{ error: boolean; vertex?: any }> {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  const driver = await getDriver(subDomain);
  const session = driver.session();
  const transaction = session.beginTransaction();

  try {
    // Cypher query to create a new vertex
    const createVertexQuery = `
      CREATE (v:${label})
      SET v = $properties, v.createdAt = localDateTime()
      RETURN v
    `;
    const vertexResult = await transaction.run(createVertexQuery, { properties });

    if (vertexResult.records.length === 0) {
      throw new Error("Failed to create vertex.");
    }

    const newVertex = convertNodeToJson(vertexResult.records[0].get("v"));
    await transaction.commit();

    return { error: false, vertex: newVertex };
  } catch (error) {
    console.error("Error creating new vertex:", error);
    await transaction.rollback();
    return { error: true };
  } finally {
    await session.close();
  }
}
