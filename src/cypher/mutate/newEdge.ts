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
  properties: { [key: string]: any } = {}
): Promise<{ edge?: any; error: boolean }> {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  const driver = await getDriver(subDomain);
  const session = driver.session();
  const transaction = session.beginTransaction();

  try {
    const createEdgeQuery = `
      MATCH (startVertex), (endVertex)
      WHERE id(startVertex) = $startVertexId AND id(endVertex) = $endVertexId
      CREATE (startVertex)-[e:${edgeType}]->(endVertex)
      SET e = $properties, e.createdAt = localDateTime()
      RETURN e
    `;

    const edgeResult = await transaction.run(createEdgeQuery, {
      startVertexId: int(startVertexId),
      endVertexId: int(endVertexId),
      properties
    });

    if (edgeResult.records.length === 0) {
      throw new Error("Failed to create edge.");
    }

    const newEdge = convertRelationshipToJson(edgeResult.records[0].get("e"));
    await transaction.commit();

    return { edge: newEdge, error: false };
  } catch (error) {
    console.error("Error creating new edge:", error);
    await transaction.rollback();
    return { error: true };
  } finally {
    await session.close();
  }
}
