import type { Session } from "neo4j-driver";
import { fetchDataFromDB } from "~/cypher/get/fetchDataFromDB";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/edge/getEdgesFromRowsAttr";
import { FormMetaData } from "~/lib/meta/formMetaData";

export async function fetchComponentDataPure(
  componentNames: string[],
  dbSession?: Session,
  subDomain?: string,
) {
  const { incoming, outgoing } = getEdgesFromRowsAttr(
    FormMetaData.Component.attributes,
  );
  return await fetchDataFromDB(
    {
      expression: `g:'Component[$initial]'`,
      incoming,
      outgoing,
    },
    {
      nodes: {},
      relationships: {},
      ...(dbSession ? { dbSession } : {}),
      ...(subDomain ? { subDomain } : {}),
      $initial: { filter: { key: { $in: componentNames } } },
    },
  );
}
