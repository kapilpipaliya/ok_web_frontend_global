import type { ServerResult } from "~/cypher/types/ServerResult";
import type { GraphData } from "~/lib/types/GraphData";
import type {
  FetchFormDataResult,
  FetchFormMetaDataResult,
} from "~/pages/functions/fetchPageData";

export function stripVertexAdjacency(
  graph?: GraphData | ServerResult["graph"],
) {
  if (!graph?.vertexes) {
    return;
  }

  for (const vertex of Object.values(graph.vertexes)) {
    const stripped = vertex as {
      IN?: typeof vertex.IN;
      OUT?: typeof vertex.OUT;
    };
    delete stripped.IN;
    delete stripped.OUT;
  }
}

export function stripServerResultGraph(serverResult?: ServerResult) {
  stripVertexAdjacency(serverResult?.graph);
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
