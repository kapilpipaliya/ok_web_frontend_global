/* eslint-disable perfectionist/sort-objects */
import type { TextFieldOptionsField } from "./FieldSchemaType";

import { CSSWideKeywords, extraPropertyValues } from "./CSSMetadata";
import { createSelectOptions } from "./FieldSchemaType";
import { gapFields } from "./FlexContainer";

export const GridContainer = {
  grid: {
    componentName: "textFieldOptions",
    label: "Grid",
    name: "grid",
    type: "text",
  } as TextFieldOptionsField,
  gridTemplate: {
    componentName: "textFieldOptions",
    label: "Grid Template",
    name: "grid-template",
    type: "text",
  } as TextFieldOptionsField,
  gridTemplateAreas: {
    componentName: "textFieldOptions",
    label: "Grid Template Areas",
    name: "grid-template-areas",
    type: "text",
  } as TextFieldOptionsField,
  gridTemplateColumns: {
    componentName: "textFieldOptions",
    label: "Grid Template Columns",
    name: "grid-template-columns",
    type: "text",
  } as TextFieldOptionsField,
  gridTemplateRows: {
    componentName: "textFieldOptions",
    label: "Grid Template Rows",
    name: "grid-template-rows",
    type: "text",
  } as TextFieldOptionsField,
  ...gapFields,
  gridAutoRows: {
    componentName: "textFieldOptions",
    label: "Grid Auto Rows",
    name: "grid-auto-rows",
    type: "text",
  } as TextFieldOptionsField,
  gridAutoColumns: {
    componentName: "textFieldOptions",
    label: "Grid Auto Columns",
    name: "grid-auto-columns",
    type: "text",
  } as TextFieldOptionsField,
  gridAutoFlow: createSelectOptions("grid-auto-flow", "Grid Auto Flow", [
    ...extraPropertyValues["grid-auto-flow"].values,
    ...CSSWideKeywords,
  ]),

  alignItems: createSelectOptions("align-items", "Align items", [
    ...extraPropertyValues["align-items"].values,
    ...CSSWideKeywords,
  ]),
  justifyItems: createSelectOptions("justify-items", "Justify items", [
    ...extraPropertyValues["justify-items"].values,
    ...CSSWideKeywords,
  ]),
  alignContent: createSelectOptions("align-content", "Align Content", [
    ...extraPropertyValues["align-content"].values,
    ...CSSWideKeywords,
  ]),
  justifyContent: createSelectOptions("justify-content", "Justify content", [
    ...extraPropertyValues["justify-content"].values,
    ...CSSWideKeywords,
  ]),
  // not needed: place-items (ai + ji)
};
