import { getValueFromVertexOrKey, capitalizeFirstLetter } from "../Utils";

import { Vertex, IdAttr } from "../graph";


export function getToEdge(meta: Vertex, vertex: Vertex): string {
  if (meta.P.props?.type) return getValueFromVertexOrKey(meta.P.props, "type");

  const attributeId = meta.P[IdAttr];
  return (
    capitalizeFirstLetter(vertex.L[0]) + capitalizeFirstLetter(attributeId)
  );
}
