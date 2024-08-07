import { capitalizeFirstLetter } from "~/lib/data_structure/string/capitalizeFirstLetter";
import { IdAttr, type Vertex } from "~/lib/graph/graph";

export function getToEdge(meta: Vertex, vertex: Vertex): string {
  if (meta.P.type) {
    return meta.P.type;
  }

  const attributeId = meta.P[IdAttr];
  return (
    capitalizeFirstLetter(vertex.L[0]) + capitalizeFirstLetter(attributeId)
  );
}
