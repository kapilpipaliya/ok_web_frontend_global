import jsep from "jsep";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { isObject } from "~/lib/data_structure/object/isObject";
import { evaluate } from "~/lib/expression_eval";

import type { CSSStore } from "../CssEditorContext";

import { arrayToString } from "./arrayToString";
import { getCssSelectedFileEdgeName } from "./getCssSelectedFileEdgeName";

export function getUrl(data: Vertex) {
  return `/api/file/download?fileId=${data.id}`;
}

export function cssStateToString(cssStore: CSSStore, meta: Vertex, data: Vertex, graph: GraphInterface) {
  if (!cssStore) { return ""; }

  return Object.entries(cssStore)
    .map(([state, value]) => {
      if (!value || state === undefined) { return; }
      if (isObject(value)) {
        return Object.entries(value)
          .map(([key, val]) => {
            const selector = state && state !== "undefined" ? `${state}` : ""
            if (Array.isArray(val)) {
              const stateValue = arrayToString(key,val);
              return `${key}:${stateValue}${selector}`;
            }
            let stateValue = val.toString().replaceAll(" ", "|");
            if (stateValue.includes("$1")) {
              const edgeName = getCssSelectedFileEdgeName(data.L[0], meta.P.name, selector || "Default", key);
              const files = evaluate(jsep(`->${edgeName}`), { graph, setGraph: ()=>{}, vertexes: [data] }) || [];
              if (files.length === 0) {
                return "";
              }
              const file = files[0];
              stateValue = stateValue.replaceAll("$1", getUrl(file));
            }
            return `${key}:${stateValue}${selector}`;
          })
          .join("\n");
      }
    })
    .filter(Boolean) // To remove any undefined entries
    .join("\n");
}
