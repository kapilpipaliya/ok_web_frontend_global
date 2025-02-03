import { isObject } from "~/lib/data_structure/object/isObject";

import { generateBoxShadow } from "./generate/generateBoxShadow";
import { generateFilter } from "./generate/generateFilter";
import { generateTextShadow } from "./generate/generateTextShadow";
import { generateTransform } from "./generate/generateTransform";
import { generateTransition } from "./generate/generateTransition";

export function arrayToString(key: string, arr: any[]): string {
  if (!arr) return '';
  if (key === "box-shadow") {
    return generateBoxShadow(arr);
  }
  if (key === "text-shadow") {
    return generateTextShadow(arr);
  }
  if (key === "filter") {
    return generateFilter(arr);
  }
  if (key === "transition") {
    return generateTransition(arr);
  }
  if (key === "transform") {
    return generateTransform(arr);
  }
  return arr.filter(item => item)
    .map((item) => {
      if (isObject(item)) {
        return Object.entries(item)
          .map(
            ([key, value]) => `${key}:${value.toString().replaceAll(" ", "|")}`,
          )
          .join(" ");
      }
      return item.toString().replaceAll(" ", "|");
    })
    .join(" ");
}
