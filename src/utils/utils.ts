import { getChildVertexes, getOptionLabel } from "../lib/Traverse";
import { Vertex } from "../lib/graph";

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
// This method read all property vertexes and make an object.
export const getProps = (meta: Vertex) => (getChildVertexes(["$0Prop"], [meta]).vertexes || []).reduce((acc, curr) => {
  const key = getOptionLabel(curr, "->$0Key:P.key");
  if (key) {
    acc[key] = curr.P.value;
  }
  return acc;
}, {} as { [key: string]: any });

export function getValueFromVertexOrKey(obj: {[key: string]: Vertex} | any, key: string) {
  return obj[key]?.id ? obj[key].P.value : obj[key];
}