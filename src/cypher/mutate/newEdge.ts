import { int } from "neo4j-driver";
import { getRequestURL } from "vinxi/http";

import type { Id } from "~/lib/graph/graph";

import { getDriver } from "~/cypher/driver";
import { convertRelationshipToJson } from "~/lib/convertNodeToJson";
import { getSubDomain } from "~/server/getSubDomain";

export async function newEdgeMGCall(
  edgeType: string,
  startVertexId: Id,
  endVertexId: Id,
  properties: { [key: string]: any } = {},
) {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  const driver = getDriver(subDomain);
  const transaction = (await driver).session().beginTransaction();

  try {
    const createEdgeQuery = `
      MATCH (startVertex), (endVertex)
      WHERE id(startVertex) = $startVertexId AND id(endVertex) = $toId
      CREATE (startVertex)-[e:${edgeType}]->(endVertex)
      SET e.createdAt = localDateTime()
      RETURN e
    `;
    const edgeResult = await transaction.run(createEdgeQuery, {
      startVertexId: int(startVertexId),
      toId: int(endVertexId),
    });

    // Extract the new vertex ID from the result
    if (edgeResult.records.length === 0) {
      throw new Error("Failed to create Edge.");
    }

    const newEdge = convertRelationshipToJson(edgeResult.records[0].get("e"));
    // Commit the transaction
    await transaction.commit();

    return {
      edge: newEdge,
      error: false,
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
