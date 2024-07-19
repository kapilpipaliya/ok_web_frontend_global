import type { SetStoreFunction, Store } from "solid-js/store";

import jsep from "jsep";

import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";

import { genericInputComponents } from "~/components/form/genericInputComponents";
import { validateInput } from "~/components/page_designer/settings/properties/validations/validateInput";
import { evaluate } from "~/lib/expression_eval";
import { getChildVertex } from "~/lib/graph/get/sync/traverse";

import type {
  FieldAttribute,
  IFormMetaData,
} from "../../../lib/FormMetadataType";

import { mergeVertexProperties } from "../../../lib/graph/mutate/vertex";
import { sortVertexesByPosition } from "../../../lib/sortVertexesByPosition";

export function getChildrenAttrs(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  child: Vertex,
): Vertex[] {
  if (!child) {
    return [];
  }
  return sortVertexesByPosition(evaluate(jsep("->Attr"), { graph, setGraph, vertexes: [child] }) || []);
}


// todo: write test for this function
export function getFormMetaData(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  rootVertex: Vertex,
  ignoreTable?: boolean,
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
    const componentName = getChildVertex(graph, ["$0Comp"], vertex).vertex?.P.name;

    if (
      vertex !== rootVertex &&
      (genericInputComponents.includes(componentName) ||
        componentName === "DynamicTable")
    ) {
      result.push({
        id: vertex.id,
        ...vertex.P,
        attributes:
          componentName === "DynamicTable" && !ignoreTable
            ? getFormMetaData(graph, setGraph, vertex, ignoreTable).attributes
            : undefined,
        componentName: componentName,
        name: vertex.P.name,
        title: parentComponent === "Label" ? parent.P.label : vertex.P.title,
      });
    }
    if (vertex !== rootVertex && componentName === "DynamicTable") {
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
          componentName,
        ),
        //title: componentName === "Label" ? vertex.P.label : child.P.title,
        componentName: childComponent,
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

type RuleToIDMap = { [RuleId: string]: Id[] };
export type IDToRuleMap = { [id: string]: string[] };

export function convertToIdToRuleMap(ruleToIDMap: RuleToIDMap): IDToRuleMap {
  const idToRuleMap: IDToRuleMap = {};

  for (const ruleId in ruleToIDMap) {
    const idArrays = ruleToIDMap[ruleId];

    idArrays.forEach(id => {
      if (!idToRuleMap[id]) {
        idToRuleMap[id] = [];
      }
      idToRuleMap[id].push(ruleId);
    });
  }

  return idToRuleMap;
}

export function getAllFieldsUsedInAllRules(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  formVertex: Vertex,
): IDToRuleMap {
  if (!formVertex) {
    return {};
  }
  const rules = evaluate(jsep("->Rule"), { graph, setGraph, vertexes: [formVertex] }) || [];
  const ruleToIDMap: RuleToIDMap = {};
  rules.forEach((rule: Vertex) => {
    ruleToIDMap[rule.id] = (
      evaluate(jsep("(->$0Cond->$0LeftField)++(->$0Cond->$0RightField)"), { graph, setGraph, vertexes: [rule] }) || []
    ).map((vertex: Vertex) => vertex.id);
  });
  return convertToIdToRuleMap(ruleToIDMap);
}

export function isAttrUsedInRules(attrVertex: Vertex, usedAttrsInRules: IDToRuleMap, graph: GraphInterface): IDToRuleMap {
  const result: IDToRuleMap = {};

  function collectUsedAttrs(vertex: Vertex, usedAttrsInRules: IDToRuleMap, graph: GraphInterface, result: IDToRuleMap) {
    if (usedAttrsInRules[vertex.id]) {
      result[vertex.id] = usedAttrsInRules[vertex.id];
    }

    const children = getChildrenAttrs(graph, {}, vertex);
    children.forEach(child => {
      collectUsedAttrs(child, usedAttrsInRules, graph, result);
    });
  }

  collectUsedAttrs(attrVertex, usedAttrsInRules, graph, result);
  return result;
}

export function getAllFieldsUsedInRootLevelSetting(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  formVertex: Vertex,
  layoutVertex: Vertex,
  projection: string
): Id[] {
  const allUniqueKeys = evaluate(jsep(projection), { graph, setGraph, vertexes: [formVertex] }) || [];
  const allUniqueKeyIds = allUniqueKeys.map((key: Vertex) => key.id);

  const fieldsUsedInUniqueConstraints = [] as Id[];

  function collectUniqueConstraints(vertex: Vertex) {
    if (allUniqueKeyIds.includes(vertex.id)) {
      fieldsUsedInUniqueConstraints.push(vertex.id);
    }
    getChildrenAttrs(graph, setGraph, vertex).forEach(collectUniqueConstraints);
  }
  collectUniqueConstraints(layoutVertex);

  return fieldsUsedInUniqueConstraints
}


export function allFormAttrsInPageFromLevel(
  graph: Store<GraphInterface>,
  parent: Vertex,
  componentLabel: string,
  excludeVertices: Id[] = []
): Id[] { 
  const verticesWithFormAttr: Id[] = [];

  function collectFormProperties(vertex: Vertex): void {
    if (excludeVertices.includes(vertex.id)) {
      return;
    }
    const compLabel = evaluate(jsep("->$0Comp"), { graph, vertexes: [vertex] })?.[0]?.P.name;

    if (compLabel === componentLabel) {
      verticesWithFormAttr.push(vertex.id);
    }

    const children = evaluate(jsep("->Attr"), { graph, vertexes: [vertex] }) || [];
    for (const child of children) {
      collectFormProperties(child);
    }
  }

  collectFormProperties(parent);

  return verticesWithFormAttr;
}
