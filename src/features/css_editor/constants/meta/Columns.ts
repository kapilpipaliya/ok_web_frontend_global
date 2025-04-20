/* eslint-disable perfectionist/sort-objects */
import type { TextFieldOptionsField } from "../FieldSchemaType";
import { createSelectOptions } from "../FieldSchemaType";

import { sizeTypes } from "../csseditor_constants";
import { CSSWideKeywords } from "./CSSMetadata";

export const ColumnsSection = {
  columnCount: {
    componentName: "string",
    label: "Column Count",
    key: "column-count",
    type: "number",
  } as TextFieldOptionsField,
  columnGap: {
    componentName: "string",
    label: "Column Gap",
    key: "column-gap",
    unitOptions: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,
  columnRule: {
    componentName: "string",
    label: "Column Rule",
    key: "column-rule",
    type: "text",
  } as TextFieldOptionsField,
  columnRuleColor: {
    componentName: "string",
    label: "Column Rule Color",
    key: "column-rule-color",
    type: "text",
  } as TextFieldOptionsField,
  columnRuleStyle: {
    componentName: "string",
    label: "Column Rule Style",
    key: "column-rule-style",
    type: "text",
  } as TextFieldOptionsField,
  columnRuleWidth: {
    componentName: "string",
    label: "Column Rule Width",
    key: "column-rule-width",
    type: "text",
  } as TextFieldOptionsField, // thin, medium, thick, number value
  columnFill: createSelectOptions("column-fill", "Column Fill", [
    "auto",
    "balance",
    "balance-all",
    ...CSSWideKeywords,
  ]),
  columnSpan: createSelectOptions("column-span", "Column Span", [
    "all",
    "none",
    ...CSSWideKeywords,
  ]),
  breakBefore: createSelectOptions("break-before", "Break Before", [
    "auto",
    "always",
    "avoid",
    "avoid-page",
    "avoid-column",
    "avoid-region",
    "page",
    "region",
    "column",
    "all",
    "left",
    "right",
    "recto",
    "verso",
    ...CSSWideKeywords,
  ]),
  breakAfter: createSelectOptions("break-after", "Break After", [
    "auto",
    "always",
    "avoid",
    "avoid-page",
    "avoid-column",
    "avoid-region",
    "page",
    "region",
    "column",
    "all",
    "left",
    "right",
    "recto",
    "verso",
    ...CSSWideKeywords,
  ]),
  breakInside: createSelectOptions("break-inside", "Break Inside", [
    "auto",
    "avoid",
    "avoid-page",
    "avoid-column",
    "avoid-region",
    "page",
    "region",
    "column",
    "all",
    "left",
    "right",
    "recto",
    "verso",
    ...CSSWideKeywords,
  ]),
};
