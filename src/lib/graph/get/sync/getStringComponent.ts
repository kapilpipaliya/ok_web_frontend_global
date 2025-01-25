import type { Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";

export function getStringComponent(
) {
  return "TextInput";
}
