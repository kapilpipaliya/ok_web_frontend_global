import { isObject } from "~/lib/data_structure/object/isObject";

import { generateBoxShadow } from "./generate/generateBoxShadow";
import { generateFilter } from "./generate/generateFilter";
import { generateTextShadow } from "./generate/generateTextShadow";
import { generateTransform } from "./generate/generateTransform";
import { generateTransition } from "./generate/generateTransition";

export function arrayToString(name: string, arr: any[]): string {
  return arr
    .map((item) => {
      if (isObject(item)) {
        if (name === "box-shadow") {
          return generateBoxShadow(arr);
        }
        if (name === "text-shadow") {
          return generateTextShadow(arr);
        }
        if (name === "filter") {
          return generateFilter(arr);
        }
        if (name === "transition") {
          return generateTransition(arr);
        }
        if (name === "transform") {
          return generateTransform(arr);
        }
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
