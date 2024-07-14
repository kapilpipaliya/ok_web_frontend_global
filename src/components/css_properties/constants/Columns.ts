/* eslint-disable perfectionist/sort-objects */
import type {
  TextFieldOptionsField,
} from "./FieldType";

import { CSSWideKeywords, } from "./CSSMetadata";
import { createSelectOptions } from "./FieldType";
import { sizeTypes } from "./constants";

export const ColumnsSection = {
  columnCount: {
    component: "textFieldOptions",
    isAddToClass: false,
    isLabelOnTop: true,
    label: "Column Count",
    name: "column-count",
    options: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,
  columnGap: {
    component: "textFieldOptions",
    isAddToClass: false,
    isLabelOnTop: true,
    label: "Column Gap",
    name: "column-gap",
    options: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,
  columnRule: {component: "textFieldOptions", label: "Column Rule", name: "column-rule", type: "text"} as TextFieldOptionsField,
  columnRuleColor: {component: "textFieldOptions", label: "Column Rule Color", name: "column-rule-color", type: "text"} as TextFieldOptionsField,
  columnRuleStyle: {component: "textFieldOptions", label: "Column Rule Style", name: "column-rule-style", type: "text"} as TextFieldOptionsField,
  columnRuleWidth: {component: "textFieldOptions", label: "Column Rule Width", name: "column-rule-width", type: "text"} as TextFieldOptionsField, // thin, medium, thick, number value
  columnFill: createSelectOptions("column-fill", "Column Fill", ['auto', 'balance', 'balance-all', ...CSSWideKeywords]),
  columnSpan: createSelectOptions("column-span", "Column Span", ['all', 'none', ...CSSWideKeywords]),
  breakBefore: createSelectOptions("break-before", "Break Before", ['auto', 'always', 'avoid', 'avoid-page', 'avoid-column', 'avoid-region', 'page', 'region', 'column', 'all', 'left', 'right', 'recto', 'verso', ...CSSWideKeywords]),
  breakAfter: createSelectOptions("break-after", "Break After", ['auto', 'always', 'avoid', 'avoid-page', 'avoid-column', 'avoid-region', 'page', 'region', 'column', 'all', 'left', 'right', 'recto', 'verso', ...CSSWideKeywords]),
  breakInside: createSelectOptions("break-inside", "Break Inside", ['auto', 'avoid', 'avoid-page', 'avoid-column', 'avoid-region', 'page', 'region', 'column', 'all', 'left', 'right', 'recto', 'verso', ...CSSWideKeywords]),
};