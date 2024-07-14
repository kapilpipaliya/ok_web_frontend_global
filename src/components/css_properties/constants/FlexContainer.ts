/* eslint-disable perfectionist/sort-objects */
import type {
  FieldWithCustomProperty,
} from "./FieldType";

import { CSSWideKeywords, extraPropertyValues } from "./CSSMetadata";
import { createButtonGroupOptions, createSelectOptions } from "./FieldType";
import { Icons } from "./Icons";
import { sizeTypes } from "./constants";

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

  flex: createButtonGroupOptions("flex", "Flex", [
    { key: Icons.flex.auto, tooltip: "auto", value: "0 0 auto" },
    { key: Icons.flex.expand, tooltip: "expand", value: "1 1 0%" },
    { key: Icons.flex.collapse, tooltip: "collapse", value: "0 1 auto" },
    { key: "customIcon", tooltip: "Custom", value: "custom" },
  ]),
};