import type {APIEvent} from "@solidjs/start/dist/server";

import {type Session, types} from "neo4j-driver";

import {getDriver} from "~/cypher/driver";
import { getDataMGCall } from "~/cypher/get/getDataMGCall";
import {convertNodeToJson, convertRelationshipToJson} from "~/lib/convertNodeToJson";
import { FormMetaData } from "~/lib/formMetaData";
import { getEdgesFromRowsAttr } from "~/lib/getEdgesFromRowsAttr";
import {getSubDomain} from "~/server/getSubDomain";

type JsonData = Record<string, any>;
// exporting this function breaks the api
async function getInitialData(args: {
  subdomain: string;
}): Promise<{ [key: string]: any }> {
  const nodeObj: JsonData = {};
  const relationshipObj: JsonData = {};

  const session = (await getDriver(args.subdomain)).session();
  await fetchFromMGAndSaveToArray(
    session,
    `MATCH (n:DataType)
    OPTIONAL MATCH (n)-[r]->(m)
    RETURN n, r, m`,
    {},
    nodeObj,
    relationshipObj,
  );
  await fetchFromMGAndSaveToArray(
    session,
    `MATCH (n:CompCategory)
      OPTIONAL MATCH (n)-[r]->(m)
      RETURN n, r, m`,
    {},
    nodeObj,
    relationshipObj,
  );
  const form = FormMetaData.Comp;
  const { incoming, outgoing } = getEdgesFromRowsAttr(form.attributes);
  const result = await getDataMGCall({
    expression: `g:'Comp'`,
    incoming,
    outgoing,
  });
  if (result.graph) {
    Object.assign(nodeObj, result.graph.vertexes);
    Object.assign(relationshipObj, result.graph.edges);
  }

  await session.close();
  return {
    edges: relationshipObj,
    timestamp: new Date().getTime(),
    vertexes: nodeObj,
  };
}

async function fetchFromMGAndSaveToArray(
  session: Session,
  query: string,
  params: Record<string, any>,
  nodeObj: JsonData,
  relationshipObj: JsonData,
): Promise<{
  nodeObj: JsonData;
  relationshipObj: JsonData;
}> {
  try {
    const result = await session.run(query, params);

    for (const record of result.records) {
      record.forEach((value) => {
        if (value instanceof types.Node) {
          const id = value.elementId;
          nodeObj[id] = convertNodeToJson(value);
        } else if (value instanceof types.Relationship) {
          const id = value.elementId;
          relationshipObj[id] = convertRelationshipToJson(value);
        } else if (Array.isArray(value)) {
          for (const item of value) {
            const id = item.elementId;
            if (item instanceof types.Node) {
              nodeObj[id] = convertNodeToJson(item);
            } else if (item instanceof types.Relationship) {
              relationshipObj[id] = convertRelationshipToJson(item);
            }
          }
        }
      });
    }

    return {nodeObj, relationshipObj};
  } catch (error) {
    console.error("Failed to execute query:", query, "Error:", error);
    throw error;
  }
}

export async function GET({ request }: APIEvent) {
  // const { formName, formId } = await request.json();
  const subdomain = await getSubDomain(request.headers.get("host")!);

  try {
    return getInitialData({ subdomain });
  } catch (error) {
    console.error("Failed to get Initial Data", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
