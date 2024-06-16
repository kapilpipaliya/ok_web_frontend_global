import { getDriver } from "~/cypher/driver";
import { getRequestURL } from "vinxi/http";
import { getSubDomain } from "~/server/getSubDomain";
import {
  convertNodeToJson,
  convertRelationshipToJson,
} from "~/lib/convertNodeToJson";
import { int } from "neo4j-driver";
import type { Id } from "~/lib/graph/graph";

export async function newRowMGCall(
  parentVertexId: Id,
  label: string,
  edgeType?: string,
  properties: any = {},
) {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  const driver = getDriver(subDomain);
  const transaction = (await driver).session().beginTransaction();

  try {
    // Cypher query to create a new vertex
    const createVertexQuery = `CREATE (v:${
      label || edgeType
    }) SET v = $properties SET v.createdAt = localDateTime(), v.updatedAt = localDateTime() RETURN v`;
    const vertexResult = await transaction.run(createVertexQuery, {
      properties,
    });

    // Extract the new vertex ID from the result
    if (vertexResult.records.length === 0) {
      throw new Error("Failed to create vertex.");
    }
    const newVertex = convertNodeToJson(vertexResult.records[0].get("v"));

    // Cypher query to create an edge
    const createEdgeQuery = `
      MATCH (startVertex), (endVertex)
      WHERE id(startVertex) = $parentVertexId AND id(endVertex) = $toId
      CREATE (startVertex)-[e:${edgeType || label!}]->(endVertex) 
      SET e.createdAt = localDateTime()
      RETURN e
    `;
    const edgeResult = await transaction.run(createEdgeQuery, {
      parentVertexId: int(parentVertexId),
      toId: int(newVertex.id),
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
      vertex: newVertex,
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
