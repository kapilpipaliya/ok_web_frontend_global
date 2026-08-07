import type { Session } from "neo4j-driver";
import { fetchDataFromDB } from "~/cypher/get/fetchDataFromDB";

export async function fetchComponentDataPure(
  componentNames: string[],
  dbSession?: Session,
  subDomain?: string,
) {
  return await fetchDataFromDB(
    {
      expression: `g:'Component[$initial]'`,
      formKey: "Component",
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
