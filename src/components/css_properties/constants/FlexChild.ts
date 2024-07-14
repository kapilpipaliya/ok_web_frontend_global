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

export const FlexChild = {
  flex: createButtonGroupOptions("flex", "Flex", [
    { key: Icons.flex.auto, tooltip: "auto", value: "0 0 auto" },
    { key: Icons.flex.expand, tooltip: "expand", value: "1 1 0%" },
    { key: Icons.flex.collapse, tooltip: "collapse", value: "0 1 auto" },
    { key: "customIcon", tooltip: "Custom", value: "custom" },
  ]),
  order: {
    component: "textFieldOptions",
    label: "Order",
    name: "order",
    type: "number",
  } as TextFieldOptionsField,
  alignSelf: createSelectOptions("align-self", "Align Self", [...extraPropertyValues["align-self"].values, ...CSSWideKeywords]),
  justifySelf: createSelectOptions("justify-self", "Justify Self", [...extraPropertyValues["justify-self"].values, ...CSSWideKeywords]),
  // not needed: place-self (as + js)
};