import type { FieldWithCustomProperty } from "../FieldSchemaType";

import { sizeTypes } from "../csseditor_constants";

export const MarginAndPaddingSection: {
  [key: string]: FieldWithCustomProperty;
} = {
  margin: {
    componentName: "fieldWithCustomProperty",
    customProperty: [
      { key: "margin-left", label: "Left" },
      { key: "margin-right", label: "Right" },
      { key: "margin-top", label: "Top" },
      { key: "margin-bottom", label: "Bottom" },
    ],
    gridType: "repeat(2,auto)",
    isLabelOnTop: true,
    key: "margin",
    label: "Margin",
    mainFieldType: "string",
    options: sizeTypes,
    type: "number",
  },

  padding: {
    componentName: "fieldWithCustomProperty",
    customProperty: [
      { key: "padding-left", label: "Left" },
      { key: "padding-right", label: "Right" },
      { key: "padding-top", label: "Top" },
      { key: "padding-bottom", label: "Bottom" },
    ],
    gridType: "repeat(2,auto)",
    isLabelOnTop: true,
    key: "padding",
    label: "Padding",
    mainFieldType: "string",
    options: sizeTypes,
    type: "number",
  },
};
