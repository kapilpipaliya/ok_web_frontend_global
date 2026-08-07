import type { NestedExpression } from "~/cypher/types/NestedExpression";
import { FormMetaData } from "~/lib/meta/formMetaData";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/edge/getEdgesFromRowsAttr";

export type FormFetchEdges = {
  incoming: NestedExpression[];
  outgoing: NestedExpression[];
};

/**
 * Form schemas that nest past SolidStart's seroval depthLimit (64).
 * Never send their `attributes` trees or derived NestedExpression over `/_server`.
 */
export const DEEP_FORM_META_KEYS = new Set([
  "Page",
  "Component",
  "CompExample",
  "Template",
  "EmailTemplate",
]);

export function isDeepFormMetaKey(key?: string): boolean {
  return !!key && DEEP_FORM_META_KEYS.has(key);
}

export function resolveEdgesFromFormKey(
  formKey?: string,
  ignoreTables = false,
): FormFetchEdges | undefined {
  if (!formKey || !FormMetaData[formKey]) {
    return undefined;
  }
  return getEdgesFromRowsAttr(FormMetaData[formKey].attributes, ignoreTables);
}

/** Fill incoming/outgoing from FormMetaData when `expression.formKey` is set. */
export function applyFormKeyToExpression(
  expression: NestedExpression,
): NestedExpression {
  const edges = resolveEdgesFromFormKey(
    expression.formKey,
    expression.ignoreTables === true,
  );
  if (!edges) {
    return expression;
  }
  return { ...expression, ...edges };
}
