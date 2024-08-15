import type { Edge, Vertex } from "~/lib/graph/graph";

import { getDriver } from "~/cypher/driver";
import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import {fetchFromMGAndSaveToArray} from "~/cypher/get/fetchFromMGAndSaveToArray";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/getEdgesFromRowsAttr";
import { FormMetaData } from "~/lib/meta/formMetaData";

// exporting this function breaks the api
export async function getInitialData(args: { subdomain: string; }) {
  const nodeObj: Record<string, Vertex> = {};
  const relationshipObj: Record<string, Edge> = {};

  const session = (await getDriver(args.subdomain)).session();

  try {
    await fetchFromMGAndSaveToArray(
      session,
      "MATCH (n:DataType) OPTIONAL MATCH (n)-[r]->(m) RETURN n, r, m",
      {},
      nodeObj,
      relationshipObj
    );
    await fetchFromMGAndSaveToArray(
      session,
      "MATCH (n:CompCategory) OPTIONAL MATCH (n)-[r]->(m) RETURN n, r, m",
      {},
      nodeObj,
      relationshipObj
    );

    await fetchAndSaveFormMetaData('Comp', nodeObj, relationshipObj);
    await fetchAndSaveFormMetaData('CompExample', nodeObj, relationshipObj);
  } catch (error: any) {
    return { error: error.message };
  } finally {
    await session.close(); // Ensure the session is always closed
  }

  return {
    edges: relationshipObj,
    timestamp: new Date().getTime(),
    vertexes: nodeObj,
  };
}

async function fetchAndSaveFormMetaData(formName: string, nodeObj: Record<string, Vertex>, relationshipObj: Record<string, Edge>) {
  const form = FormMetaData[formName];
  const { incoming, outgoing } = getEdgesFromRowsAttr(form.attributes);
  const result = await fetchDataFromMG({
    expression: `g:'${formName}'`,
    incoming,
    outgoing,
  });

  if (result.graph) {
    // TODO: modify so it not break existing edges and vertexes
    Object.assign(nodeObj, result.graph.vertexes);
    Object.assign(relationshipObj, result.graph.edges);
  }
}
