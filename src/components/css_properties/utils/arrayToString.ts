import { isObject } from "~/lib/utils";

import { generateBoxShadow } from "./generate/generateBoxShadow";
import { generateFilter } from "./generate/generateFilter";
import { generateTextShadow } from "./generate/generateTextShadow";
import { generateTransform } from "./generate/generateTransform";
import { generateTransition } from "./generate/generateTransition";

export function arrayToString(name: string, arr: any[]): string {
  return arr.map(item => {
    if (isObject(item)) {
      if (name === "box-shadow") {
        return generateBoxShadow(arr);
      } else if (name === "text-shadow") {
        return generateTextShadow(arr);
      } else if (name === "filter") {
        return generateFilter(arr);
      } else if (name === "transition") {
        return generateTransition(arr);
      } else if (name === "transform") {
        return generateTransform(arr);
      }
      return Object.entries(item)
        .map(([key, value]) => `${key}:${value.toString().replaceAll(" ", "|")}`)
        .join(" ");
    }
    return item.toString().replaceAll(" ", "|");
  }).join(" ");
}
