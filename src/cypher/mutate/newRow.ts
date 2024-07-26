import { int } from "neo4j-driver";
import { getRequestURL } from "vinxi/http";

import type { Id } from "~/lib/graph/graph";

import { getDriver } from "~/cypher/driver";
import {
  convertNodeToJson,
  convertRelationshipToJson,
} from "~/lib/convertNodeToJson";
import { getSubDomain } from "~/server/getSubDomain";

export async function newRowMGCall(
  parentVertexId: Id,
  label: string,
  edgeType?: string,
  properties: any = {}
): Promise<{ error: boolean; vertex?: any; edge?: any }> {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  const driver = await getDriver(subDomain);
  const session = driver.session();
  const transaction = session.beginTransaction();

  try {
    // Create the new vertex
    const createVertexQuery = `
      CREATE (v:${label || edgeType})
      SET v = $properties, v.createdAt = localDateTime(), v.updatedAt = localDateTime()
      RETURN v
    `;
    const vertexResult = await transaction.run(createVertexQuery, { properties });

    if (vertexResult.records.length === 0) {
      throw new Error("Failed to create vertex.");
    }

    const newVertex = convertNodeToJson(vertexResult.records[0].get("v"));

    // Create the edge between the parent and new vertex
    const createEdgeQuery = `
      MATCH (startVertex), (endVertex)
      WHERE id(startVertex) = $parentVertexId AND id(endVertex) = $newVertexId
      CREATE (startVertex)-[e:${edgeType || label}]->(endVertex)
      SET e.createdAt = localDateTime()
      RETURN e
    `;
    const edgeResult = await transaction.run(createEdgeQuery, {
      parentVertexId: int(parentVertexId),
      newVertexId: int(newVertex.id),
    });

    if (edgeResult.records.length === 0) {
      throw new Error("Failed to create edge.");
    }

    const newEdge = convertRelationshipToJson(edgeResult.records[0].get("e"));

    // Commit the transaction
    await transaction.commit();

    return { error: false, vertex: newVertex, edge: newEdge };
  } catch (error) {
    console.error("Error creating new row:", error);

    // Rollback the transaction in case of an error
    await transaction.rollback();
    return { error: true };
  } finally {
    await session.close();
  }
}
