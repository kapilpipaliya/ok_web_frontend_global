import type { SetStoreFunction, Store } from "solid-js/store";

import jsep from "jsep";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { genericInputComponents } from "~/components/form/genericInputComponents";
import { validateInput } from "~/components/page_designer/settings/properties/validations/validateInput";
import { evaluate } from "~/lib/expression_eval";
import { getChildVertex } from "~/lib/graph/get/sync/traverse";

import type {
  FieldAttribute,
  IFormMetaData,
} from "../../../lib/FormMetadataType";

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

// todo: write test for this function
export function getFormMetaData(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  rootVertex: Vertex,
): IFormMetaData {
  const result: FieldAttribute[] = [];
  function getAllInputFields(
    graph: Store<GraphInterface>,
    setGraph: SetStoreFunction<GraphInterface>,
    vertex: Vertex,
    parent: Vertex,
    parentComponent: string,
  ): FieldAttribute[] {
    const children = getChildrenAttrs(graph, setGraph, vertex);
    const component = getChildVertex(graph, ["$0Comp"], vertex).vertex?.P.name;

    if (
      vertex !== rootVertex &&
      (genericInputComponents.includes(component) ||
        component === "DynamicTable")
    ) {
      result.push({
        id: vertex.id,
        ...vertex.P,
        attributes:
          component === "DynamicTable"
            ? getFormMetaData(graph, setGraph, vertex).attributes
            : undefined,
        component: component,
        name: vertex.P.name,
        title: parentComponent === "Label" ? parent.P.label : vertex.P.title,
      });
    }
    if (vertex !== rootVertex && component === "DynamicTable") {
      return [];
    }
    return children.map((child) => {
      const childComponent = getChildVertex(graph, ["$0Comp"], child).vertex?.P
        .name;
      return {
        attributes: getAllInputFields(
          graph,
          setGraph,
          child,
          vertex,
          component,
        ),
        //title: component === "Label" ? vertex.P.label : child.P.title,
        component: childComponent,
        id: child.id,
        name: child.P.name,
      };
    });
  }
  getAllInputFields(graph, setGraph, rootVertex, rootVertex, "");

  return {
    attributes: result,
    id: rootVertex.id,
    name: rootVertex.P.name,
    title: rootVertex.P.title,
  };
}
// use it when new field is drag and drop.
export function getUniqueName(
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  formVertex: Vertex,
  layoutVertex: Vertex,
) {
  let uniqueId = (formVertex.P.lastUniqueId || 0) + 1;

  while (
    isUniqueIdUsed(
      graph,
      setGraph,
      formVertex,
      layoutVertex,
      `unique_${uniqueId}`,
    )
  ) {
    uniqueId++;
  }

  // setGraph('vertexes', formVertex.id, { P: { lastUniqueId: uniqueId } });
  mergeVertexProperties(txnId, formVertex.id, graph, setGraph, {
    lastUniqueId: uniqueId,
  });
  return `unique_${uniqueId}`;
}

export function isUniqueIdUsed(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  formVertex: Vertex,
  layoutVertex: Vertex,
  name: string,
) {
  function checkVertex(attrVertex: Vertex) {
    if (attrVertex.P.name === name && attrVertex.id !== layoutVertex.id) {
      return true;
    }

    return getChildrenAttrs(graph, setGraph, attrVertex).some(checkVertex);
  }

  return getChildrenAttrs(graph, setGraph, formVertex).some(checkVertex);
}

export function isAnyFieldInvalid(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  formVertex: Vertex,
  data: Vertex,
) {
  function checkVertex(attrVertex: Vertex) {
    if (attrVertex.P.validation) {
      const value = data.P[attrVertex.P.name];
      const error = validateInput(attrVertex.P.validation, value);
      mergeVertexProperties(0, attrVertex.id, graph, setGraph, {
        error: error || "",
      });
      if (error) {
        return true;
      }
    }

    return getChildrenAttrs(graph, setGraph, attrVertex).some(checkVertex);
  }

  return getChildrenAttrs(graph, setGraph, formVertex).some(checkVertex);
}
