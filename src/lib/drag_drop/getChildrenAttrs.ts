import type { SetStoreFunction, Store } from "solid-js/store";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import { evaluate } from "~/lib/expression_eval";
import jsep from "jsep";
import { mergeVertexProperties } from "../graph/mutate/vertex";
import { validateInput } from "~/components/page_designer/settings/validateInput";
import type { FieldAttribute, IFormMetaData } from "../FormMetadataType";
import { getComponent } from "~/components/page_attr_render/utils/getComponent";
import { genericInputComponents } from "~/components/form/DynamicComponent";

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

export function getFormMetaData(graph: Store<GraphInterface>, setGraph: SetStoreFunction<GraphInterface>, vertex: Vertex): IFormMetaData {
  const result: FieldAttribute[] = [];
  function getAllInputFields(graph: Store<GraphInterface>, setGraph: SetStoreFunction<GraphInterface>, vertex: Vertex, parent: Vertex, parentComponent: string): FieldAttribute[] {
    const children = getChildrenAttrs(graph, setGraph, vertex);
    const component = getComponent(graph, vertex)?.P.name;
    if (genericInputComponents.includes(component)) {
      result.push({
        ...vertex.P,
        name: vertex.P.name,
        title: parentComponent === "Label" ? parent.P.label : vertex.P.title,
        component: component,
      });
    }
    return children.map((child) => {
      const childComponent = getComponent(graph, child)?.P.name;
      return ({
        name: child.P.name,
        //title: component === "Label" ? vertex.P.label : child.P.title,
        component: childComponent,
        attributes: getAllInputFields(graph, setGraph, child, vertex, component),
      });
    });
  }
  getAllInputFields(graph, setGraph, vertex, vertex, "");

  return {
    name: vertex.P.name,
    title: vertex.P.title,
    attributes: result,
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
