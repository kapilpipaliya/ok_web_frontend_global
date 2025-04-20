import type { Id } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

export function getTabLabel(openedFormId: Id, graph: GraphInterface) {
  const baseLabel = graph.vertexes[openedFormId]?.P.label || "";

  // Get formId from openedFormId
  const formId = graph.vertexes[openedFormId]?.P.formId;
  if (!formId) {
    return baseLabel;
  }

  // Get formDataId from formId
  const formDataId = graph.vertexes[formId]?.P.formDataId;
  if (!formDataId) {
    return baseLabel;
  }

  // Get key from formDataId
  const key = graph.vertexes[formDataId]?.P.key;

  return key ? `${baseLabel} - ${key}` : baseLabel;
}
