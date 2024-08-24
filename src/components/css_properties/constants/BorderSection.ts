import type { FieldWithCustomProperty } from "./FieldSchemaType";

import { defaultPixelSizeTypes, sizeTypes } from "./csseditor_constants";
import { extraPropertyValues } from "./CSSMetadata";

export const BorderSection: { [key: string]: FieldWithCustomProperty } = {
  borderColor: {
    componentName: "fieldWithCustomProperty",
    customProperty: [
      { label: "Border Top", name: "border-top-color" },
      { label: "Border Left", name: "border-left-color" },
      { label: "Border Right", name: "border-right-color" },
      { label: "Border Bottom", name: "border-bottom-color" },
    ],
    gridType: "repeat(2,auto)",
    isLabelOnTop: true,
    label: "Border Color",
    mainFieldType: "colorPicker",
    name: "border-color",
    type: "number",
  },
  borderRadius: {
    componentName: "fieldWithCustomProperty",
    customProperty: [
      { label: "Top Left", name: "border-top-left-radius" }, // rtl
      { label: "Top Right", name: "border-top-right-radius" }, // rtr
      { label: "Bottom Right", name: "border-bottom-right-radius" }, // rbl
      { label: "Bottom Bottom", name: "border-bottom-left-radius" }, // rbr
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
    componentName: "fieldWithCustomProperty",
    customProperty: [
      { label: "Border Top", name: "border-top-style" },
      { label: "Border Left", name: "border-left-style" },
      { label: "Border Right", name: "border-right-style" },
      { label: "Border Bottom", name: "border-bottom-style" },
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
    componentName: "fieldWithCustomProperty",
    customProperty: [
      { label: "Border Top", name: "border-top-width" },
      { label: "Border Left", name: "border-left-width" },
      { label: "Border Right", name: "border-right-width" },
      { label: "Border Bottom", name: "border-bottom-width" },
    ],
    gridType: "repeat(2,auto)",
    isLabelOnTop: true,
    label: "Border Width",
    mainFieldType: "textFieldOptions",
    name: "border-width",
    options: defaultPixelSizeTypes,
    type: "number",
    // TODO: Add support for options
    // options: extraPropertyValues["border-width"].values,
  },
};
