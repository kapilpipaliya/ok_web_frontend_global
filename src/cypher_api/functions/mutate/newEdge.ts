import { getDriver } from "../../server/driver";
import { getRequestURL } from "vinxi/http";
import { getSubDomain } from "../../server/domain_utils";
import { convertRelationshipToJson } from "~/lib/convertNodeToJson";

export async function newEdgeMGCall(
  edgeType: string,
  startVertexId: number,
  endVertexId: number,
  properties: { [key: string]: any } = {},
) {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  const driver = getDriver(subDomain);
  const transaction = (await driver).session().beginTransaction();

  try {
    let createEdgeQuery = `
      MATCH (startVertex), (endVertex)
      WHERE id(startVertex) = $startVertexId AND id(endVertex) = $toId
      CREATE (startVertex)-[e:${edgeType}]->(endVertex)
      RETURN e
    `;
    const edgeResult = await transaction.run(createEdgeQuery, {
      startVertexId,
      toId: endVertexId,
    });

    // Extract the new vertex ID from the result
    if (edgeResult.records.length === 0) {
      throw new Error("Failed to create Edge.");
    }

    const newEdge = convertRelationshipToJson(edgeResult.records[0].get("e"));
    // Commit the transaction
    await transaction.commit();

    return {
      error: false,
      edge: newEdge,
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
