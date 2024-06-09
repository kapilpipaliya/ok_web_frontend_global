import { getRequestURL } from "vinxi/http";
import { getSubDomain } from "~/server/domain_utils";
import { getDriver } from "~/cypher/driver";
import { int } from "neo4j-driver";

export async function deleteRelationShipMGCall(edgeId: string | number | any) {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  const driver = getDriver(subDomain);
  const transaction = (await driver).session().beginTransaction();
  try {
    // Cypher query to create a new vertex
    const createVertexQuery = `MATCH ()-[rel]->()
WHERE id(rel) = $edgeId
DELETE rel`;
    const vertexResult = await transaction.run(createVertexQuery, {
      edgeId: int(edgeId),
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
