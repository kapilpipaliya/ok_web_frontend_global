import { getDriver } from "~/cypher/driver";
import { getRequestURL } from "vinxi/http";
import { getSubDomain } from "~/server/getSubDomain";
import { convertNodeToJson } from "~/lib/convertNodeToJson";

export async function newVertexDBCall(
  label: string,
  properties?: { [key: string]: any },
) {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  const driver = getDriver(subDomain);
  const transaction = (await driver).session().beginTransaction();

  try {
    // Cypher query to create a new vertex
    const createVertexQuery = `CREATE (v:${label}) SET v = $properties SET v.createdAt = localDateTime() RETURN v`;
    const vertexResult = await transaction.run(createVertexQuery, {
      properties,
    });

    // Extract the new vertex ID from the result
    if (vertexResult.records.length === 0) {
      throw new Error("Failed to create vertex.");
    }
    const newVertex = convertNodeToJson(vertexResult.records[0].get("v"));

    // Commit the transaction
    await transaction.commit();

    return {
      error: false,
      vertex: newVertex,
    };
  } catch (error) {
    console.error(error);

    // Rollback the transaction in case of an error
    await transaction.rollback();
    return { error: true };
  } finally {
    // await session.close();
    // on application exit:
    // await driver.close();
  }
}
