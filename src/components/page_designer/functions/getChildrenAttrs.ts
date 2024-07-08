import type { SetStoreFunction, Store } from "solid-js/store";

import jsep from "jsep";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { genericInputComponents } from "~/components/form/genericInputComponents";
import { getComponent } from "~/components/page_attr_render/utils/getComponent";
import { validateInput } from "~/components/page_designer/settings/validateInput";
import { evaluate } from "~/lib/expression_eval";

import type { FieldAttribute, IFormMetaData } from "../../../lib/FormMetadataType";

import { mergeVertexProperties } from "../../../lib/graph/mutate/vertex";

export function getChildrenAttrs(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  child: Vertex,
): Vertex[] {
  if (!child) {
    return [];
  }
  return (
    evaluate(jsep("->Attr"), { graph, setGraph, vertexes: [child] }) || []
  ).sort((a: Vertex, b: Vertex) => a.P.pos - b.P.pos);
}

export function getFormMetaData(graph: Store<GraphInterface>, setGraph: SetStoreFunction<GraphInterface>, vertex: Vertex): IFormMetaData {
  const result: FieldAttribute[] = [];
  function getAllInputFields(graph: Store<GraphInterface>, setGraph: SetStoreFunction<GraphInterface>, vertex: Vertex, parent: Vertex, parentComponent: string): FieldAttribute[] {
    const children = getChildrenAttrs(graph, setGraph, vertex);
    const component = getComponent(graph, vertex)?.P.name;
    if (genericInputComponents.includes(component)) {
      result.push({
        ...vertex.P,
        component: component,
        name: vertex.P.name,
        title: parentComponent === "Label" ? parent.P.label : vertex.P.title,
      });
    }
    return children.map((child) => {
      const childComponent = getComponent(graph, child)?.P.name;
      return ({
        attributes: getAllInputFields(graph, setGraph, child, vertex, component),
        //title: component === "Label" ? vertex.P.label : child.P.title,
        component: childComponent,
        name: child.P.name,
      });
    });
  }
  getAllInputFields(graph, setGraph, vertex, vertex, "");

  return {
    attributes: result,
    name: vertex.P.name,
    title: vertex.P.title,
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
