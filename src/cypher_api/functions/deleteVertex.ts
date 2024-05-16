import neo4j from "neo4j-driver";
import { DBConnection } from "~/cypher_api/functions/dbs";

export async function deleteVertexMGCall(
  dbConn: DBConnection,
  nodeId: string | number | any,
) {
  "use server";
  dbConn.session ||= dbConn.driver.session({
    defaultAccessMode: neo4j.session.WRITE,
  });
  const transaction = dbConn.session.beginTransaction();

  try {
    // Cypher query to create a new vertex
    let createVertexQuery = `MATCH (n)
WHERE id(n) = $nodeId
DELETE n`;
    const vertexResult = await transaction.run(createVertexQuery, { nodeId });

    // Commit the transaction
    await transaction.commit();

    return {
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
