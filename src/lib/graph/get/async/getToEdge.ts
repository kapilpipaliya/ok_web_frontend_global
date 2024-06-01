import { capitalizeFirstLetter, getValueFromVertexOrKey } from "~/lib/Utils";

import { IdAttr, type Vertex } from "~/lib/graph/graph";

export async function getToEdgeAsync(
  meta: Vertex,
  vertex: Vertex,
): Promise<string> {
  if (meta.P.props?.type) return getValueFromVertexOrKey(meta.P.props, "type");

  const attributeId = meta.P[IdAttr];
  return (
    capitalizeFirstLetter(vertex.L[0]) + capitalizeFirstLetter(attributeId)
  );
}
