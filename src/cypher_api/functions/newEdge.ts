import neo4j from "neo4j-driver";
import { DBConnection } from "~/cypher_api/functions/dbs";
import { Relationship } from "~/cypher_api/functions/Type"

export async function newEdgeMGCall(
  dbConn: DBConnection,
  edgeType: string,
  startVertexId: number,
  endVertexId: number,
  properties: { [key: string]: any } = {},
) {
  "use server";
  dbConn.session ||= dbConn.driver.session({
    defaultAccessMode: neo4j.session.WRITE,
  });
  const transaction = dbConn.session.beginTransaction();

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
    const newEdge = edgeResult.records[0].get("e") as Relationship;
    newEdge.id = newEdge.identity!;
    newEdge.T = newEdge.type!;
    newEdge.S = newEdge.start!;
    newEdge.E = newEdge.end!;
    newEdge.P = newEdge.properties!;

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
