/* eslint-disable perfectionist/sort-objects */
import type { TextFieldOptionsField } from "./FieldSchemaType";

import { CSSWideKeywords, extraPropertyValues } from "./CSSMetadata";
import { createSelectOptions } from "./FieldSchemaType";
import { gapFields } from "./FlexContainer";

export const GridContainer = {
  grid: {
    componentName: "string",
    label: "Grid",
    key: "grid",
    type: "text",
  } as TextFieldOptionsField,
  gridTemplate: {
    componentName: "string",
    label: "Grid Template",
    key: "grid-template",
    type: "text",
  } as TextFieldOptionsField,
  gridTemplateAreas: {
    componentName: "string",
    label: "Grid Template Areas",
    key: "grid-template-areas",
    type: "text",
  } as TextFieldOptionsField,
  gridTemplateColumns: {
    componentName: "string",
    label: "Grid Template Columns",
    key: "grid-template-columns",
    type: "text",
  } as TextFieldOptionsField,
  gridTemplateRows: {
    componentName: "string",
    label: "Grid Template Rows",
    key: "grid-template-rows",
    type: "text",
  } as TextFieldOptionsField,
  ...gapFields,
  gridAutoRows: {
    componentName: "string",
    label: "Grid Auto Rows",
    key: "grid-auto-rows",
    type: "text",
  } as TextFieldOptionsField,
  gridAutoColumns: {
    componentName: "string",
    label: "Grid Auto Columns",
    key: "grid-auto-columns",
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
