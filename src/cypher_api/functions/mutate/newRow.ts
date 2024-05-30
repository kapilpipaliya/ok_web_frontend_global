import { getDriver } from "../../server/driver";
import { getRequestURL } from "vinxi/http";
import { getSubDomain } from "../../server/domain_utils";
import { convertNodeToJson, convertRelationshipToJson } from "~/lib/convertNodeToJson";

export async function newRowMGCall(
  parentVertexId: number,
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
    let createVertexQuery = `CREATE (v:${label || edgeType}) SET v = $properties RETURN v`;
    const vertexResult = await transaction.run(createVertexQuery, {
      properties,
    });

    // Extract the new vertex ID from the result
    if (vertexResult.records.length === 0) {
      throw new Error("Failed to create vertex.");
    }
    const newVertex = convertNodeToJson(vertexResult.records[0].get("v"));

    // Cypher query to create an edge
    let createEdgeQuery = `
      MATCH (startVertex), (endVertex)
      WHERE id(startVertex) = $parentVertexId AND id(endVertex) = $toId
      CREATE (startVertex)-[e:${edgeType || label!}]->(endVertex)
      RETURN e
    `;
    const edgeResult = await transaction.run(createEdgeQuery, {
      parentVertexId,
      toId: newVertex.id,
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
