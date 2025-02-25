import type { GraphInterface } from "~/lib/graph/graph";

import { ServerResult } from "~/cypher/types/ServerResult";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";

import { getGlobalStore } from "../get/sync/getGlobalStore";

// Renamed to reflect that it only fetches data
export async function fetchInitialData(graph: GraphInterface): Promise<ServerResult> {
  const url = getGlobalStore(graph).P.url
    ? `?${getGlobalStore(graph).P.url}=true`
    : "";
  return await getAPI(`${API.getInitialDataUrl}${url}`);
}
