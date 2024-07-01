import type { Store } from "solid-js/store";

import { untrack } from "solid-js";

import {
  getParentVertexValue,
  getSelectedVertexValue
} from "~/lib/graph/get/sync/traverse";
import {
  type GraphInterface,
  type Id,
  IdAttr,
  type Vertex
} from "~/lib/graph/graph";

import { ensureArray } from "./ensureArray";


export function selectedValue(
  meta: Vertex,
  data: Vertex,
  graph: Store<GraphInterface>
): Id[] {
  if (meta.P.stringValue || meta.P.items) {
    // this is causing maximum call stack error when selecting an option
    return untrack(() => ensureArray(data.P[meta.P[IdAttr]]));
  }
  try {
    // when new row added or modified this gives error.
    return meta.P.inward
      ? getParentVertexValue(graph, data, meta)
      : getSelectedVertexValue(graph, data, meta);
  } catch (e) {
    return [];
  }
}
