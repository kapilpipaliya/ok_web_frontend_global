import type { Session } from "neo4j-driver";

import type { Edge, Vertex } from "~/lib/graph/graph";

import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { fetchFromMGAndSaveToArray } from "~/cypher/get/fetchFromMGAndSaveToArray";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/getEdgesFromRowsAttr";
import { FormMetaData } from "~/lib/meta/formMetaData";

// exporting this function breaks the api
export async function getInitialData(dbSession: Session) {
  const nodeObj: Record<string, Vertex> = {};
  const relationshipObj: Record<string, Edge> = {};

  try {
    // await fetchFromMGAndSaveToArray(
    //   dbSession,
    //   "MATCH (n:DataType) OPTIONAL MATCH (n)-[r]->(m) RETURN n, r, m",
    //   {},
    //   nodeObj,
    //   relationshipObj,
    // );
    // await fetchFromMGAndSaveToArray(
    //   dbSession,
    //   "MATCH (n:CompCategory) OPTIONAL MATCH (n)-[r]->(m) RETURN n, r, m",
    //   {},
    //   nodeObj,
    //   relationshipObj,
    // );



    // await fetchAndSaveFormMetaData("Comp", nodeObj, relationshipObj, dbSession);
    // await fetchAndSaveFormMetaData("CompExample", nodeObj, relationshipObj, dbSession);

    // Not needed
    // await fetchFromMGAndSaveToArray(
    //   dbSession,
    //   "MATCH (n:GlobalSetting)  OPTIONAL MATCH (n)-[r]->(m) RETURN n, r, m",
    //   {},
    //   nodeObj,
    //   relationshipObj,
    // );
    await fetchAndSaveFormMetaData("GlobalSetting", nodeObj, relationshipObj, dbSession);
  } catch (error: any) {
    return { error: error.message };
  }

  return {
    edges: relationshipObj,
    timestamp: new Date().getTime(),
    vertexes: nodeObj,
  };
}

async function fetchAndSaveFormMetaData(
  formName: string,
  nodeObj: Record<string, Vertex>,
  relationshipObj: Record<string, Edge>,
  dbSession: Session,
) {
  const form = FormMetaData[formName];
  const { incoming, outgoing } = getEdgesFromRowsAttr(form.attributes);
  const result = await fetchDataFromMG(
    {
      expression: `g:'${formName}'`,
      incoming,
      outgoing,
    },
    { dbSession, nodes: nodeObj, relationships: relationshipObj },
    false,
  );

  if (result.graph) {
    // TODO: modify so it not break existing edges and vertexes
    Object.assign(nodeObj, result.graph.vertexes);
    Object.assign(relationshipObj, result.graph.edges);
  }
}
