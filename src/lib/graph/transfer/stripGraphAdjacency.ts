import type { ServerResult } from "~/cypher/types/ServerResult";
import type { FetchFormDataResult, FetchFormMetaDataResult } from "~/pages/functions/fetchPageData";

export function stripServerResultGraph(serverResult?: ServerResult) {
  if (!serverResult?.graph?.vertexes) {
    return;
  }

  for (const vertex of Object.values(serverResult.graph.vertexes)) {
    vertex.IN = {};
    vertex.OUT = {};
  }
}

export function stripFetchFormMetaDataResultForTransfer(
  metaResult?: FetchFormMetaDataResult,
) {
  if (!metaResult) {
    return;
  }

  stripServerResultGraph(metaResult.data);
  stripServerResultGraph(metaResult.componentData);
}

export function stripFetchFormDataResultForTransfer(
  dataResult?: FetchFormDataResult,
) {
  if (!dataResult) {
    return;
  }

  stripServerResultGraph(dataResult.data);
  stripServerResultGraph(dataResult.componentData);
}
