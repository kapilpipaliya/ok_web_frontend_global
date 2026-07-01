import type { NestedExpression } from "~/cypher/types/NestedExpression";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { getEdgesFromGraph } from "~/lib/graph/get/sync/edge/getEdgesFromGraph";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/edge/getEdgesFromRowsAttr";
import { restoreVertexAdjacencyFromEdges } from "~/lib/graph/transfer/restoreVertexAdjacencyFromEdges";
import type { FetchFormMetaDataResult } from "~/pages/functions/fetchPageData";
import type { Id } from "~/lib/graph/type/id";

export function resolveFormFetchEdges(
  metaResult: Pick<FetchFormMetaDataResult, "data" | "form">,
  formMetaId: Id,
  graph?: GraphInterface,
): {
  incoming: NestedExpression[];
  outgoing: NestedExpression[];
} {
  if (metaResult.form) {
    return getEdgesFromRowsAttr(metaResult.form.attributes);
  }

  if (graph?.vertexes[formMetaId]) {
    return getEdgesFromGraph(graph, formMetaId);
  }

  const graphData = metaResult.data?.graph;
  if (!graphData?.vertexes) {
    return { incoming: [], outgoing: [] };
  }

  restoreVertexAdjacencyFromEdges(graphData);
  return getEdgesFromGraph(graphData as GraphInterface, formMetaId);
}
