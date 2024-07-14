/* eslint-disable perfectionist/sort-objects */
import type {
  DividerField,
  FieldWithCustomProperty,
  TextFieldOptionsField,
} from "./FieldType";

import { CSSWideKeywords, extraPropertyValues } from "./CSSMetadata";
import { createButtonGroupOptions, createSelectOptions } from "./FieldType";
import { Icons } from "./Icons";
import { sizeTypes } from "./constants";

export const GridContainer = {
  grid: {
    component: "textFieldOptions",
    label: "Grid",
    name: "grid",
    type: "text",
  } as TextFieldOptionsField,
  gridTemplate: {
    component: "textFieldOptions",
    label: "Grid Template",
    name: "grid-template",
    type: "text",
  } as TextFieldOptionsField,
  gridTemplateAreas: {
    component: "textFieldOptions",
    label: "Grid Template Areas",
    name: "grid-template-areas",
    type: "text",
  } as TextFieldOptionsField,
  gridTemplateColumns: {
    component: "textFieldOptions",
    label: "Grid Template Columns",
    name: "grid-template-columns",
    type: "text",
  } as TextFieldOptionsField,
  gridTemplateRows: {
    component: "textFieldOptions",
    label: "Grid Template Rows",
    name: "grid-template-rows",
    type: "text",
  } as TextFieldOptionsField,
  // TOdo either simplify gap as number, or replace gap-x with row-gap and gap-y with column-gap
  gap: {
    component: "fieldWithCustomProperty",
    customProperty: [
      { label: "Column", name: "gap-x" },
      { label: "Row", name: "gap-y" },
    ],
    gridType: "repeat(2,auto)",
    isLabelOnTop: true,
    label: "Gap",
    mainFieldType: "textFieldOptions",
    name: "gap",
    options: sizeTypes,
    type: "number",
  } as FieldWithCustomProperty,
  rowGap: {
    component: "textFieldOptions",
    label: "Row Gap",
    name: "row-gap",
    type: "number",
  } as TextFieldOptionsField,
  columnGap: {
    component: "textFieldOptions",
    label: "Column Gap",
    name: "column-gap",
    type: "number",
  } as TextFieldOptionsField,
  gridAutoRows: {
    component: "textFieldOptions",
    label: "Grid Auto Rows",
    name: "grid-auto-rows",
    type: "text",
  } as TextFieldOptionsField,
  gridAutoColumns: {
    component: "textFieldOptions",
    label: "Grid Auto Columns",
    name: "grid-auto-columns",
    type: "text",
  } as TextFieldOptionsField,
  gridAutoFlow: createSelectOptions("grid-auto-flow", "Grid Auto Flow", [...extraPropertyValues["grid-auto-flow"].values, ...CSSWideKeywords]),

  alignItems: createSelectOptions("align-items", "Align items", [...extraPropertyValues["align-items"].values, ...CSSWideKeywords]),
  justifyItems: createSelectOptions("justify-items", "Justify items",  [...extraPropertyValues["justify-items"].values, ...CSSWideKeywords]),
  alignContent: createSelectOptions("align-content", "Align Content", [...extraPropertyValues["align-content"].values, ...CSSWideKeywords]),
  justifyContent: createSelectOptions("justify-content", "Justify content",  [...extraPropertyValues["justify-content"].values, ...CSSWideKeywords]),
  // not needed: place-items (ai + ji)

};