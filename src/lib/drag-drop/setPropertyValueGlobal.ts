import type {SetStoreFunction, Store} from "solid-js/store";
import type {GraphInterface, Vertex} from "~/lib/graph/graph";
import {untrack} from "solid-js";
import {getChildVertex, getChildVertexes} from "~/lib/graph/get/sync/traverse";
import {mergeVertexProperties, newVertex} from "~/lib/graph/mutate/vertex";
import {addNewRow} from "~/lib/graph/mutate/form_functions";

import {setSelectionValue} from "~/lib/graph/mutate/setSelectionValue";

export function setPropertyValueGlobal(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  meta: Vertex,
  layoutVertex: Vertex,
  componentVertex: Vertex,
  value: any,
  valueSet?: boolean,
) {
  return untrack(() => {
    // find existing row;
    const rowProps =
      getChildVertexes(graph, ["$0Prop"], [layoutVertex]).vertexes || [];
    let row = rowProps.find((vertex) => {
      const name = getChildVertex(graph, ["$0Name"], vertex).vertex;
      return name?.P.name === meta.P.name;
    });
    if (row) {
      if (valueSet ?? true)
        mergeVertexProperties(txnId, row.id, graph, setGraph, {value});
    } else {
      const propMetaVertex = newVertex("", ["Meta"], {
        name: "Prop",
        displayName: "Property",
      });
      const componentProps =
        getChildVertexes(graph, ["$0Prop"], [componentVertex]).vertexes || [];
      const componentProp = componentProps.find((vertex) => {
        return vertex.P.name === meta.P.name;
      });
      if (componentProp) {
        const properties = valueSet ?? true ? {value} : {};
        const addRowResult = addNewRow(
          txnId,
          propMetaVertex,
          graph,
          setGraph,
          layoutVertex,
          properties,
          false,
          {} as any,
        );
        if (addRowResult.vertexId) {
          row = graph.vertexes[addRowResult.vertexId];
          setSelectionValue(
            txnId,
            graph.vertexes[addRowResult.vertexId],
            graph,
            setGraph,
            {P: {name: "Name"}} as unknown as Vertex,
            componentProp.id,
          );
        }
      } else {
        console.error(
          `component prop ${meta.P.name} is not found in component ${componentVertex.P.name}. so skipped inserting property.`,
        );
      }
    }
    // TODO: if reset, delete the row.
    return row;
  });
}