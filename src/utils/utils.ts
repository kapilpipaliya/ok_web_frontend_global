import {getChildVertexes, getSelectionOptions} from "../lib/Traverse";
import { Vertex } from "../lib/graph";

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
// This method read all property vertexes and make an object.
export const getProps = (meta: Vertex) => (getChildVertexes(["$0Prop"], [meta]).vertexes || []).reduce((acc, curr) => {
  const key = getSelectionOptions([curr], "T:(->$0Key::'P.key')").vertexes;
  if (key) {
    acc[key] = curr.P.value;
  }
  return acc;
}, {} as { [key: string]: any });

export function getValueFromVertexOrKey(obj: {[key: string]: Vertex} | any, key: string) {
  return obj?.[key];
  // return obj[key]?.id ? obj[key].P.value : obj[key];
}




// ts-belt
export  function isNumber(i: any) {
  if ("number" == typeof i) {
    return !Number.isNaN(i);
  } else {
    return !1;
  }
}



export function isObject(i: any) {
  if (i && !Array.isArray(i)) {
    return "object" == typeof i;
  } else {
    return !1;
  }
}

export function groupBy(xs: { [key: string]: any }[], groupFn: (record: { [key: string]: any }) => string) {
  return xs.reduce((acc, element) => {
    const key = groupFn(element);
    const value = acc[key];
    if (value !== void 0) {
      value.push(element);
    } else {
      acc[key] = [element];
    }
    return acc;
  }, {});
}