 
import type { FieldWithCustomProperty, } from "./FieldType";

import { sizeTypes } from "./constants";

export const MarginAndPaddingSection: { [key: string]: FieldWithCustomProperty } = {
  margin: {
    component: "fieldWithCustomProperty",
    customProperty: [
      { label: "Left", name: "margin-left" },
      { label: "Right", name: "margin-right" },
      { label: "Top", name: "margin-top" },
      { label: "Bottom", name: "margin-bottom" },
    ],
    gridType: "repeat(2,auto)",
    isLabelOnTop: true,
    label: "Margin",
    mainFieldType: "textFieldOptions",
    name: "margin",
    options: sizeTypes,
    type: "number",
  },
 
  padding: {
    component: "fieldWithCustomProperty",
    customProperty: [
      { label: "Left", name: "padding-left" },
      { label: "Right", name: "padding-right" },
      { label: "Top", name: "padding-top" },
      { label: "Bottom", name: "padding-bottom" },
    ],
    gridType: "repeat(2,auto)",
    isLabelOnTop: true,
    label: "Padding",
    mainFieldType: "textFieldOptions",
    name: "padding",
    options: sizeTypes,
    type: "number",
  },
};
