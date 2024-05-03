import neo4j from 'neo4j-driver';
import {DBConnection} from "../lib/dbs";
import {Node, Relationship} from "../lib/graph";

export async function newRowMGCall(
  dbConn: DBConnection,
  parentVertexId: number,
  label: string,
  edgeType?: string,
  properties: {[key: string]: any} = {}
) {
  dbConn.session ||= dbConn.driver.session({ defaultAccessMode: neo4j.session.WRITE });
  const transaction = dbConn.session.beginTransaction();

  try {
    // Cypher query to create a new vertex
    let createVertexQuery = `CREATE (v:${label || edgeType}) SET v = $properties RETURN v`;
    const vertexResult = await transaction.run(createVertexQuery, { properties });

    // Extract the new vertex ID from the result
    if (vertexResult.records.length === 0) {
      throw new Error("Failed to create vertex.");
    }
    const newVertex = vertexResult.records[0].get('v') as Node;
    newVertex.id = newVertex.identity!;
    newVertex.L = newVertex.labels!;
    newVertex.P = newVertex.properties!;

    // Cypher query to create an edge
    let createEdgeQuery = `
      MATCH (startVertex), (endVertex)
      WHERE id(startVertex) = $parentVertexId AND id(endVertex) = $toId
      CREATE (startVertex)-[e:${edgeType || label!}]->(endVertex)
      RETURN e
    `;
    const edgeResult = await transaction.run(createEdgeQuery, {parentVertexId, toId: newVertex.id });

    // Extract the new vertex ID from the result
    if (edgeResult.records.length === 0) {
      throw new Error("Failed to create Edge.");
    }
    const newEdge = edgeResult.records[0].get('e') as Relationship;
    newEdge.id = newEdge.identity!;
    newEdge.T = newEdge.type!;
    newEdge.S = newEdge.start!;
    newEdge.E = newEdge.end!;
    newEdge.P = newEdge.properties!;


    // Commit the transaction
    await transaction.commit();

    return {
      error: false,
      vertex: newVertex,
      edge: newEdge
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
