
import { isObject } from "~/lib/data_structure/object/isObject";
import { evalExpression } from "~/lib/expression_eval";

import type { CSSStore } from "../context/CssEditorContext";

import { arrayToString } from "./arrayToString";
import { getCssSelectedFileEdgeName } from "./getCssSelectedFileEdgeName";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { getDownloadLink } from "~/features/file_manager/sidebar/getDownloadLink";

export function cssStateToString(
  cssStore: CSSStore | string,
  meta: Vertex,
  data: Vertex,
  graph: GraphInterface,
) {
  if (!cssStore) {
    return "";
  }
  if (typeof cssStore === "string") {
    if (cssStore.trim().startsWith("{")) {
      try {
        cssStore = JSON.parse(cssStore);
      } catch (e) {
        console.error("Invalid JSON string:", e);
        return "";
      }
    } else {
      return cssStore;
    }
  }

  return Object.entries(cssStore)
    .map(([state, value]) => {
      if (!value || state === undefined) {
        return;
      }
      if (isObject(value)) {
        return Object.entries(value)
          .map(([key, val]) => {
            const selector = state && state !== "undefined" ? `${state}` : "";
            if (Array.isArray(val)) {
              const stateValue = arrayToString(key, val);
              return `${key}:${stateValue}${selector}`;
            }
            let stateValue = val.toString().replaceAll(" ", "|");
            if (stateValue.includes("$1")) {
              const edgeName = getCssSelectedFileEdgeName(
                data.L[0],
                meta.P.key,
                selector || "Default",
                key,
              );
              stateValue = replacePlaceholderWithUrl(
                stateValue,
                edgeName,
                data,
                graph,
              );
            }
            return `${key}:${stateValue}${selector}`;
          })
          .join("\n");
      }
    })
    .filter(Boolean) // To remove any undefined entries
    .join("\n");
}

export function replacePlaceholderWithUrl(
  value: string,
  edgeName: string,
  data: Vertex,
  graph: GraphInterface,
): string {
  if (!value.includes("$1")) {
    return value;
  }

  const files =
    evalExpression(`->${edgeName}`, {
      graph,
      setGraph: () => {},
      vertexes: [data],
    }) || [];

  if (files.length === 0) {
    return value;
  }

  const file = files[0];
  return value.replaceAll("$1", getDownloadLink(file));
}
