/* eslint-disable perfectionist/sort-objects */
import type {
  TextFieldOptionsField,
} from "./FieldType";

import { defaultPixelSizeTypes } from "./csseditor_constants";
import { CSSWideKeywords, extraPropertyValues } from "./CSSMetadata";
import { createSelectOptions } from "./FieldType";

export const gapFields = {
  gap: {
    componentName: "textFieldOptions",
    label: "Gap",
    name: "gap",
    type: "number",
    unitOptions: defaultPixelSizeTypes,
  } as TextFieldOptionsField,
  rowGap: {
    componentName: "textFieldOptions",
    label: "Row Gap",
    name: "row-gap",
    type: "number",
    unitOptions: defaultPixelSizeTypes,
  } as TextFieldOptionsField,
  columnGap: {
    componentName: "textFieldOptions",
    label: "Column Gap",
    name: "column-gap",
    type: "number",
    unitOptions: defaultPixelSizeTypes,
  } as TextFieldOptionsField,
}
export const FlexContainer = {
  flexDirection: createSelectOptions("flex-direction", "Flex Direction", [
    "row","row-reverse","column","column-reverse",...CSSWideKeywords
  ]),
  alignItems: createSelectOptions("align-items", "Align items", [...extraPropertyValues["align-items"].values, ...CSSWideKeywords]),
  justifyContent: createSelectOptions("justify-content", "Justify content",  [...extraPropertyValues["justify-content"].values, ...CSSWideKeywords]),
  justifyItems: createSelectOptions("justify-items", "Justify items",  [...extraPropertyValues["justify-items"].values, ...CSSWideKeywords]),
  // not needed: place-items (ai + ji)

  flexWrap: createSelectOptions("flex-wrap", "Flex wrap", [
    { label: "No Wrap", value: "nowrap" },
    { label: "Wrap", value: "wrap" },
    { label: "Reverse Wrap", value: "wrap-reverse" },
    ...CSSWideKeywords
  ]),
  alignContent: createSelectOptions("align-content", "Align Content", [...extraPropertyValues["align-content"].values, ...CSSWideKeywords]),
 ...gapFields
};