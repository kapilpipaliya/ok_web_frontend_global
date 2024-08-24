import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { evalExpression } from "~/lib/expression_eval";

export function getTextValue(value: any) {
  if (typeof value === "string") {
    return `"${value}"`;
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return value;
}

export function getConditionsExpression(
  rule: Vertex,
  formVertex: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  isTest?: boolean,
) {
  const conditionRows = evalExpression("->RuleCond", {
    graph,
    setGraph,
    vertexes: [rule],
  });
  if (!conditionRows) {
    return "";
  }
  const getFieldValue = (fieldName: string, condition: Vertex) => {
    const evaluatedFieldName = evalExpression(fieldName, {
      graph,
      setGraph,
      vertexes: [condition],
    })?.[0]?.P.name;
    if (evaluatedFieldName) {
      return (
        getTextValue(formVertex.P[evaluatedFieldName]) ??
        (isTest ? `"${evaluatedFieldName}"` : 0)
      );
    }
    return "";
  };

  return conditionRows.reduce((expression: string, condition: Vertex) => {
    expression += condition.P.leftParen || "";
    expression +=
      getTextValue(condition.P.leftValue) ||
      getFieldValue("->$0LeftField", condition);
    expression += condition.P.operator || "";
    expression +=
      getTextValue(condition.P.rightValue) ||
      getFieldValue("->$0RightField", condition);
    expression += condition.P.rightParen || "";
    if (condition.P.andOr) {
      if (condition.P.andOr === "AND") {
        expression += " && ";
      } else if (condition.P.andOr === "OR") {
        expression += " || ";
      }
    }
    return expression;
  }, "");
}
