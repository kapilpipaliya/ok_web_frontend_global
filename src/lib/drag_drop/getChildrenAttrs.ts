import type { SetStoreFunction, Store } from "solid-js/store";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import { evaluate } from "~/lib/expression_eval";
import jsep from "jsep";
import { mergeVertexProperties } from "../graph/mutate/vertex";
import { validateInput } from "~/components/page_designer/actions/validateInput";
import { FieldAttribute, IFormMetaData } from "../FormMetadataType";
import attributeNames from "../jsx_parser/constants/attributeNames";
import { getComponent } from "~/components/page_attr_render/utils/getComponent";

export function getChildrenAttrs(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  child: Vertex,
): Vertex[] {
  if (!child) {
    return [];
  }
  return (
    evaluate(jsep("->Attr"), { vertexes: [child], graph, setGraph }) || []
  ).sort((a: Vertex, b: Vertex) => a.P.pos - b.P.pos);
}


export function getAllFields(graph: Store<GraphInterface>, setGraph: SetStoreFunction<GraphInterface>, vertex: Vertex): FieldAttribute[] {
  const children = getChildrenAttrs(graph, setGraph, vertex);
  return children.map((child) => ({
      name: vertex.P.name,
      component: getComponent(graph, vertex)?.P.name,
      attributes: getAllFields(graph, setGraph, child),
    }));
}
export function getFormMetaData(graph: Store<GraphInterface>, setGraph: SetStoreFunction<GraphInterface>, vertex: Vertex): IFormMetaData {
  return {
    name: vertex.P.name,
    title: vertex.P.title,
    attributes: getAllFields(graph, setGraph, vertex),
  };
}
// use it when new field is drag and drop.
export function getUniqueName(txnId: number, graph: Store<GraphInterface>, setGraph: SetStoreFunction<GraphInterface>, formVertex: Vertex, layoutVertex: Vertex) {
  let uniqueId = (formVertex.P.lastUniqueId || 0) + 1;

  while (isUniqueIdUsed(graph, setGraph, formVertex, layoutVertex, `unique_${uniqueId}`)) {
    uniqueId++;
  }

  // setGraph('vertexes', formVertex.id, { P: { lastUniqueId: uniqueId } });
  mergeVertexProperties(txnId, formVertex.id, graph, setGraph, {
    lastUniqueId: uniqueId,
  });
  return `unique_${uniqueId}`;
}

export function isUniqueIdUsed(graph: Store<GraphInterface>, setGraph: SetStoreFunction<GraphInterface>, formVertex: Vertex, layoutVertex: Vertex, name: string) {
  function checkVertex(attrVertex: Vertex) {
    if (attrVertex.P.name === name && attrVertex.id !== layoutVertex.id) {
      return true;
    }

    return getChildrenAttrs(
      graph,
      setGraph,
      attrVertex,
    ).some(checkVertex);
  }

  return getChildrenAttrs(
    graph,
    setGraph,
    formVertex,
  ).some(checkVertex);
}

export function isAnyFieldInvalid(graph: Store<GraphInterface>, setGraph: SetStoreFunction<GraphInterface>, formVertex: Vertex, data: Vertex) {
  function checkVertex(attrVertex: Vertex) {

    if (attrVertex.P.validation) {
      const value = data.P[attrVertex.P.name];
      const error = validateInput(attrVertex.P.validation, value);
      mergeVertexProperties(0, attrVertex.id, graph, setGraph, {
        error: error || ""
      });
      if (error) {
        return true;
      }
    }


    return getChildrenAttrs(
      graph,
      setGraph,
      attrVertex,
    ).some(checkVertex);
  }

  return getChildrenAttrs(
    graph,
    setGraph,
    formVertex,
  ).some(checkVertex);
}
