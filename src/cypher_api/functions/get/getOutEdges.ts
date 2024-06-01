import { getDriver } from "../../server/driver";
import { getRequestURL } from "vinxi/http";
import { getSubDomain } from "../../server/domain_utils";
import { convertNodeToJson, convertRelationshipToJson } from "~/lib/convertNodeToJson";
import type { Edge, Vertex } from "~/lib/graph/graph";
import { int } from "neo4j-driver";

export async function getOutEdges(
  fromId: string | any,
  type: string,
  options: {
    isInward?: boolean;
  } = {},
) {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  const driver = getDriver(subDomain);
  const transaction = (await driver).session();

  try {
    // Cypher query to create a new vertex
    const matchVertexQuery = `MATCH (sourceNode)${options.isInward ? "<-" : "-"}[relationshipType${type ? `:${type}` : ""}]${options.isInward ? "-" : "->"}(targetNode)
WHERE id(sourceNode) = $fromId
RETURN targetNode, relationshipType
`;
    const vertexResult = await transaction.run(matchVertexQuery, { fromId: int(fromId) });

    const resultNodes = [] as [Edge, Vertex][];
    for (const record of vertexResult.records) {
      const targetNode = convertNodeToJson(record.get("targetNode"));
      const targetRelationship = convertRelationshipToJson(record.get("relationshipType"));
      
      resultNodes.push([targetRelationship, targetNode]);
    }
    return {
      error: false,
      pairs: resultNodes,
    };
  } catch (error) {
    console.error(error);

    return { error: true, message: "An error occurred" };
  } finally {
    // await session.close();
    // on application exit:
    // await driver.close();
  }
}
