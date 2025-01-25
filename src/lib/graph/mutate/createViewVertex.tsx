import {GraphInterface} from "~/lib/graph/graph";
import {SetStoreFunction} from "solid-js/store";
import {addNewVertex, newVertex} from "~/lib/graph/mutate/vertex";
import {v7 as uuidv7} from "uuid";

export function createViewVertex(props: any, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>) {
  const viewVertexObject = newVertex(`${uuidv7()}-view`, ["View"], props);

  addNewVertex(0, viewVertexObject, graph, setGraph);

  return viewVertexObject;
}