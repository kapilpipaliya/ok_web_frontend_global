import { int } from "neo4j-driver";
import { getRequestURL } from "vinxi/http";

import type { Edge, Vertex } from "~/lib/graph/graph";

import { getDriver } from "~/cypher/driver";
import {
  convertNodeToJson,
  convertRelationshipToJson,
} from "~/lib/convertNodeToJson";
import { getSubDomain } from "~/server/getSubDomain";

export async function getOutEdges(
  fromId: number | string,
  type: string,
  options: { isInward?: boolean } = {}
): Promise<{ error: boolean; message?: string; pairs?: [Edge, Vertex][] }> {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  const driver = await getDriver(subDomain);
  const session = driver.session();

  try {
    const matchVertexQuery = `
      MATCH (sourceNode)${options.isInward ? "<-" : "-"}[relationshipType${
      type ? `:${type}` : ""
    }]${options.isInward ? "-" : "->"}(targetNode)
      WHERE id(sourceNode) = $fromId
      RETURN targetNode, relationshipType
    `;

    const vertexResult = await session.run(matchVertexQuery, {
      fromId: int(fromId),
    });

    const resultNodes: [Edge, Vertex][] = vertexResult.records.map((record) => {
      const targetNode = convertNodeToJson(record.get("targetNode"));
      const targetRelationship = convertRelationshipToJson(
        record.get("relationshipType")
      );
      return [targetRelationship, targetNode];
    });

    return { error: false, pairs: resultNodes };
  } catch (error) {
    console.error(error);
    return { error: true, message: "An error occurred" };
  } finally {
    await session.close();
  }
}
