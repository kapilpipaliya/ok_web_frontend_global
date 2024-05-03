import neo4j from 'neo4j-driver';
import {DBConnection} from "../lib/dbs";
import {Node} from "../lib/graph";

export async function findVertexMGCall(dbConn: DBConnection, label: string, attribute: string, value: number | string)  {
  dbConn.session ||= dbConn.driver.session({ defaultAccessMode: neo4j.session.WRITE });

  try {
    // Cypher query to create a new vertex
    let createVertexQuery = `MATCH (v:${label} {${attribute}: $value}) RETURN v`;
    const vertexResult = await dbConn.session.run(createVertexQuery, { value });

    // Extract the new vertex ID from the result
    if (vertexResult.records.length === 0) {
      return {error: true, message: 'empty result'}
    }
    const newVertex = vertexResult.records[0].get('v') as Node;
    newVertex.id = newVertex.identity!;
    newVertex.L = newVertex.labels!;
    newVertex.P = newVertex.properties!;

    return {
      error: false,
      vertex: newVertex,
    };
  } catch (error) {
    console.error(error);

    return { error: true, message: 'An error occurred' };
  } finally {
    // await session.close();
    // on application exit:
    // await driver.close();
  }
}
