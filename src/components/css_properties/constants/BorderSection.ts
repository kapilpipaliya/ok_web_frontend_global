/* eslint-disable perfectionist/sort-objects */
import { extraPropertyValues } from "./CSSMetadata";
import type { FieldWithCustomProperty } from "./FieldType";

import { sizeTypes } from "./constants";

export const BorderSection: { [key: string]: FieldWithCustomProperty } = {
  borderColor: {
    component: "fieldWithCustomProperty",
    customProperty: [
      { label: "Border Top", name: "border-top" },
      { label: "Border Left", name: "border-left" },
      { label: "Border Right", name: "border-right" },
      { label: "Border Bottom", name: "border-bottom" },
    ],
    gridType: "repeat(2,auto)",
    isLabelOnTop: true,
    label: "Border Color",
    mainFieldType: "colorPicker",
    name: "border-color",
    type: "number",
  },
  borderRadius: {
    component: "fieldWithCustomProperty",
    customProperty: [
      { label: "Top Left", name: "rtl" },
      { label: "Top Right", name: "rtr" },
      { label: "Bottom Right", name: "rbl" },
      { label: "Bottom Bottom", name: "rbr" },
    ],
    gridType: "repeat(2,auto)",
    isLabelOnTop: true,
    label: "Border Radius",
    mainFieldType: "textFieldOptions",
    name: "border-radius",
    options: sizeTypes,
    type: "number",
  },
  borderStyle: {
    component: "fieldWithCustomProperty",
    customProperty: [
      { label: "Border Top", name: "border-top" },
      { label: "Border Left", name: "border-left" },
      { label: "Border Right", name: "border-right" },
      { label: "Border Bottom", name: "border-bottom" },
    ],
    gridType: "repeat(2,auto)",
    isLabelOnTop: true,
    label: "Border Style",
    mainFieldType: "select",
    name: "border-style",
    options: extraPropertyValues["border-style"].values,
    type: "number",
  },
  borderWidth: {
    component: "fieldWithCustomProperty",
    customProperty: [
      { label: "Border Top", name: "border-top" },
      { label: "Border Left", name: "border-left" },
      { label: "Border Right", name: "border-right" },
      { label: "Border Bottom", name: "border-bottom" },
    ],
    gridType: "repeat(2,auto)",
    isLabelOnTop: true,
    label: "Border Width",
    mainFieldType: "textFieldOptions",
    name: "border-width",
    options: sizeTypes,
    type: "number",
    // TODO: Add support for options
    // options: extraPropertyValues["border-width"].values,
  },
};
