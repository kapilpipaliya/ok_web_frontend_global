import type { FieldWithCustomProperty } from "../FieldSchemaType";

import { defaultPixelSizeTypes, sizeTypes } from "../csseditor_constants";
import { extraPropertyValues } from "./CSSMetadata";

export const BorderSection: { [key: string]: FieldWithCustomProperty } = {
  borderColor: {
    componentName: "fieldWithCustomProperty",
    customProperty: [
      { key: "border-top-color", label: "Border Top" },
      { key: "border-left-color", label: "Border Left" },
      { key: "border-right-color", label: "Border Right" },
      { key: "border-bottom-color", label: "Border Bottom" },
    ],
    gridType: "repeat(2,auto)",
    isLabelOnTop: true,
    key: "border-color",
    label: "Border Color",
    mainFieldType: "colorPicker",
    type: "number",
  },
  borderRadius: {
    componentName: "fieldWithCustomProperty",
    customProperty: [
      { key: "border-top-left-radius", label: "Top Left" }, // rtl
      { key: "border-top-right-radius", label: "Top Right" }, // rtr
      { key: "border-bottom-right-radius", label: "Bottom Right" }, // rbl
      { key: "border-bottom-left-radius", label: "Bottom Bottom" }, // rbr
    ],
    gridType: "repeat(2,auto)",
    isLabelOnTop: true,
    key: "border-radius",
    label: "Border Radius",
    mainFieldType: "string",
    unitOptions: sizeTypes,
    type: "number",
  },
  borderStyle: {
    componentName: "fieldWithCustomProperty",
    customProperty: [
      { key: "border-top-style", label: "Border Top" },
      { key: "border-left-style", label: "Border Left" },
      { key: "border-right-style", label: "Border Right" },
      { key: "border-bottom-style", label: "Border Bottom" },
    ],
    gridType: "repeat(2,auto)",
    isLabelOnTop: true,
    key: "border-style",
    label: "Border Style",
    mainFieldType: "select",
    options: extraPropertyValues["border-style"].values,
    type: "number",
  },
  borderWidth: {
    componentName: "fieldWithCustomProperty",
    customProperty: [
      { key: "border-top-width", label: "Border Top" },
      { key: "border-left-width", label: "Border Left" },
      { key: "border-right-width", label: "Border Right" },
      { key: "border-bottom-width", label: "Border Bottom" },
    ],
    gridType: "repeat(2,auto)",
    isLabelOnTop: true,
    key: "border-width",
    label: "Border Width",
    mainFieldType: "string",
    unitOptions: defaultPixelSizeTypes,
    type: "number",
    // TODO: Add support for options
    // options: extraPropertyValues["border-width"].values,
  },
};
