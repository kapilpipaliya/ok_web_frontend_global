import neo4j from 'neo4j-driver';
import {DBConnection} from "../lib/dbs";
import {Node} from "../lib/graph";

export async function newVertexDBCall(
  dbConn: DBConnection,
  label: string,
  properties?: {[key: string]: any}
) {
  dbConn.session ||= dbConn.driver.session({ defaultAccessMode: neo4j.session.WRITE });
  const transaction = dbConn.session.beginTransaction();

  try {
    // Cypher query to create a new vertex
    let createVertexQuery = `CREATE (v:${label}) SET v = $properties RETURN v`;
    const vertexResult = await transaction.run(createVertexQuery, { properties });

    // Extract the new vertex ID from the result
    if (vertexResult.records.length === 0) {
      throw new Error("Failed to create vertex.");
    }
    const newVertex = vertexResult.records[0].get('v') as Node;
    newVertex.id = newVertex.identity!;
    newVertex.L = newVertex.labels!;
    newVertex.P = newVertex.properties!;

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
