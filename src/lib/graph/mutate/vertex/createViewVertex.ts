import type { SetStoreFunction } from "solid-js/store";

import { v7 as uuidv7 } from "uuid";

import type { GraphInterface } from "~/lib/graph/GraphContext";

import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { newVertex } from "~/lib/graph/mutate/core/vertex/newVertex";

export function createViewVertex(
  props: any,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const viewVertexObject = newVertex(`${uuidv7()}-view`, ["View"], props);

  addNewVertex(0, viewVertexObject, graph, setGraph);

  return viewVertexObject;
}
