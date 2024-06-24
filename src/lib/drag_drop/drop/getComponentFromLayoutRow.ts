import type {SetStoreFunction, Store} from "solid-js/store";
import {type GraphInterface, IdAttr} from "~/lib/graph/graph";
import {getChildVertex, getSelectionOptions} from "~/lib/graph/get/sync/traverse";
import {findVertexByLabelAndUniqueId} from "~/lib/graph/get/sync/findVertex";
import {getStringComponent} from "~/lib/graph/get/sync/graph_functions";

export function getComponentFromLayoutRow(layoutRowId: string | number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>) {
  // There must be a component found.
  const currentVertex = graph.vertexes[layoutRowId];
  const compVertex = getSelectionOptions(
    graph,
    setGraph,
    [currentVertex],
    "->$0Comp||->$0Att->$0Comp||->$0Att->$0DataType->$0Default"
  ).vertexes || [];
  if (compVertex[0]) {
    return compVertex[0];
  }
  const collVertex = getChildVertex(graph, ["$0Coll"], currentVertex);
  if (collVertex.vertex?.P.name === "Form") {
    return findVertexByLabelAndUniqueId(graph, "Comp", IdAttr, "Form");
  }

  return getStringComponent(graph);
}