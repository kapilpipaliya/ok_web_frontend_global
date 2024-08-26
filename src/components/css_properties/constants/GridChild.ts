/* eslint-disable perfectionist/sort-objects */
import type { TextFieldOptionsField } from "./FieldSchemaType";

import { CSSWideKeywords, extraPropertyValues } from "./CSSMetadata";
import { createSelectOptions } from "./FieldSchemaType";

export const GridChild = {
  gridArea: {
    componentName: "string",
    label: "Grid Area",
    name: "grid-area",
    type: "text",
  } as TextFieldOptionsField,
  gridRow: {
    componentName: "string",
    label: "Grid Row",
    name: "grid-row",
    type: "text",
  } as TextFieldOptionsField,
  gridColumn: {
    componentName: "string",
    label: "Grid Column",
    name: "grid-column",
    type: "text",
  } as TextFieldOptionsField,
  gridRowStart: {
    componentName: "string",
    label: "Grid Row Start",
    name: "grid-row-start",
    type: "text",
  } as TextFieldOptionsField,
  gridRowEnd: {
    componentName: "string",
    label: "Grid Row End",
    name: "grid-row-end",
    type: "text",
  } as TextFieldOptionsField,
  gridColumnStart: {
    componentName: "string",
    label: "Grid Column Start",
    name: "grid-column-start",
    type: "text",
  } as TextFieldOptionsField,
  gridColumnEnd: {
    componentName: "string",
    label: "Grid Column End",
    name: "grid-column-end",
    type: "text",
  } as TextFieldOptionsField,

  alignSelf: createSelectOptions("align-self", "Align Self", [
    ...extraPropertyValues["align-self"].values,
    ...CSSWideKeywords,
  ]),
  justifySelf: createSelectOptions("justify-self", "Justify Self", [
    ...extraPropertyValues["justify-self"].values,
    ...CSSWideKeywords,
  ]),
  // not needed: place-self (as + js)
};
