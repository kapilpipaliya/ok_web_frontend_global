/* eslint-disable perfectionist/sort-objects */
import type { TextFieldOptionsField } from "../FieldSchemaType";

import { createSelectOptions } from "../FieldSchemaType";
import { Icons } from "../Icons";
import { CSSWideKeywords, extraPropertyValues } from "./CSSMetadata";

export const FlexChild = {
  // Do we need to imporove this?
  // do we give three separate input like Basis, Grow and Shrink?
  /*flex: createButtonGroupOptions("flex", "Flex", [
    { key: Icons.flex.auto, tooltip: "auto", value: "0 0 auto" },
    { key: Icons.flex.expand, tooltip: "expand", value: "1 1 0%" },
    { key: Icons.flex.collapse, tooltip: "collapse", value: "0 1 auto" },
    { key: "customIcon", tooltip: "Custom", value: "custom" },
  ]),*/
  flex: {
    componentName: "string",
    label: "Flex",
    key: "flex",
    options: [
      { icon: Icons.flex.auto, label: "auto", value: "0 0 auto" },
      { icon: Icons.flex.expand, label: "expand", value: "1 1 0%" },
      { icon: Icons.flex.collapse, label: "collapse", value: "0 1 auto" },
      { icon: "customIcon", label: "Custom", value: "custom" },
    ],
  } as TextFieldOptionsField,
  order: {
    componentName: "string",
    label: "Order",
    key: "order",
    type: "number",
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
