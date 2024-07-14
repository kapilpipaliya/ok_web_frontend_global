/* eslint-disable perfectionist/sort-objects */
import type {
  TextFieldOptionsField,
} from "./FieldType";

import { CSSWideKeywords, extraPropertyValues } from "./CSSMetadata";
import { createSelectOptions } from "./FieldType";

export const GridChild = {
  gridArea: {component: "textFieldOptions", label: "Grid Area", name: "grid-area", type: "text"} as TextFieldOptionsField,
  gridRow: {component: "textFieldOptions", label: "Grid Row", name: "grid-row", type: "text"} as TextFieldOptionsField,
  gridColumn: {component: "textFieldOptions", label: "Grid Column", name: "grid-column", type: "text"} as TextFieldOptionsField,
  gridRowStart: {component: "textFieldOptions", label: "Grid Row Start", name: "grid-row-start", type: "text"} as TextFieldOptionsField,
  gridRowEnd: {component: "textFieldOptions", label: "Grid Row End", name: "grid-row-end", type: "text"} as TextFieldOptionsField,
  gridColumnStart: {component: "textFieldOptions", label: "Grid Column Start", name: "grid-column-start", type: "text"} as TextFieldOptionsField,
  gridColumnEnd: {component: "textFieldOptions", label: "Grid Column End", name: "grid-column-end", type: "text"} as TextFieldOptionsField,

  alignSelf: createSelectOptions("align-self", "Align Self", [...extraPropertyValues["align-self"].values, ...CSSWideKeywords]),
  justifySelf: createSelectOptions("justify-self", "Justify Self", [...extraPropertyValues["justify-self"].values, ...CSSWideKeywords]),
  // not needed: place-self (as + js)
};