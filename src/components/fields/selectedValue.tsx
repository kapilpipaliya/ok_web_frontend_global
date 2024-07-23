import type { Store } from "solid-js/store";

import { untrack } from "solid-js";

import { getParentVertexValue } from "~/lib/graph/get/sync/getParentVertexValue";
import { getSelectedVertexValue } from "~/lib/graph/get/sync/getSelectedVertexValue";
import {
  type GraphInterface,
  type Id,
  IdAttr,
  type Vertex,
} from "~/lib/graph/graph";

import { ensureArray } from "../../lib/ensureArray";
import { isStaticOptions } from "./isStaticOptions";

export function selectedValue(
  meta: Vertex,
  data: Vertex,
  graph: Store<GraphInterface>,
): Id[] {
  if (isStaticOptions(meta)) {
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
