import { getRequestURL } from "vinxi/http";
import { getDriver } from "~/cypher/driver";
import { getSubDomain } from "~/server/domain_utils";
import { int } from "neo4j-driver";

export async function deleteVertexMGCall(nodeId: string | number | any) {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  const driver = getDriver(subDomain);
  const transaction = (await driver).session().beginTransaction();
  try {
    // Cypher query to create a new vertex
    const createVertexQuery = `MATCH (n)
WHERE id(n) = $nodeId
DELETE n`;
    const vertexResult = await transaction.run(createVertexQuery, {
      nodeId: int(nodeId),
    });

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
