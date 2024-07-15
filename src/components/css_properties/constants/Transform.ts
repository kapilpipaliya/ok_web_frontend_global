/* eslint-disable perfectionist/sort-objects */

import type {
  DataEditorField,
  FieldWithCustomProperty,
  TextFieldOptionsField,
} from "./FieldType";

import { createGridOptions } from "./FieldType";
import { sizeTypes, } from "./constants";

export const Transform = {
  transform: {
    children: {
      shadow: createGridOptions("Grid", "Transform", [
        {
          component: "select",
          isLabelOnTop: true,
          label: "Type",
          name: "type",
          options: [
            "move x",
            "move y",
            "move z",
            "rotate x",
            "rotate y",
            "rotate z",
            "scale",
            "scale x",
            "scale y",
            "scale z",
            "skew x",
            "skew y",
          ],
        },
        {
          component: "textFieldOptions",
          isLabelOnTop: true,
          label: "Value",
          name: "value",
          options: sizeTypes,
          type: "number",
        } as TextFieldOptionsField,
        {
          align: "end",
          component: "fieldWithCustomProperty",
          customProperty: [
            { label: "Left", name: "transform-origin" },
            { label: "Top", name: "transform-origin" },
          ],
          gap: "5px 10px",
          "grid-template-columns": "1fr 25%",
          gridType: "repeat(2,auto)",
          isLabelOnTop: true,
          label: "Transform Origin",
          mainFieldType: "textFieldOptions",
          name: "transform-origin",
          options: sizeTypes,
          padding: "5px",
          type: "number",
        } as FieldWithCustomProperty,
        {
          component: "buttonGroups",
          isLabelOnTop: true,
          label: "Type",
          name: "transform-style",
          options: [
            { key: "2D", tooltip: "2D", value: "flat" },
            { key: "3D", tooltip: "3D", value: "preserve-3d" },
          ],
        },
      ]),
    },
    component: "dataEditor",
    dialogLabel: "Adjust Transform",
    label: "Transform",
    name: "transform",
  } as DataEditorField,
};
