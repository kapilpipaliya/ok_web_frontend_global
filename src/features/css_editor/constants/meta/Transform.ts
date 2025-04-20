import type {
  DataEditorField,
  FieldWithCustomProperty,
  TextFieldOptionsField,
} from "../FieldSchemaType";
import { createGridOptions } from "../FieldSchemaType";

import { sizeTypes } from "../csseditor_constants";

export const Transform = {
  transform: {
    children: [
      createGridOptions("Grid", "Transform", [
        {
          componentName: "select",
          isLabelOnTop: true,
          key: "type",
          label: "Type",
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
          componentName: "string",
          isLabelOnTop: true,
          key: "value",
          label: "Value",
          type: "number",
          unitOptions: sizeTypes,
        } as TextFieldOptionsField,
        {
          align: "end",
          componentName: "fieldWithCustomProperty",
          customProperty: [
            { key: "transform-origin", label: "Left" },
            { key: "transform-origin", label: "Top" },
          ],
          gap: "5px 10px",
          "grid-template-columns": "1fr 25%",
          gridType: "repeat(2,auto)",
          isLabelOnTop: true,
          key: "transform-origin",
          label: "Transform Origin",
          mainFieldType: "string",
          options: sizeTypes,
          padding: "5px",
          type: "number",
        } as FieldWithCustomProperty,
        {
          componentName: "buttonGroups",
          isLabelOnTop: true,
          key: "transform-style",
          label: "Type",
          options: [
            { key: "2D", tooltip: "2D", value: "flat" },
            { key: "3D", tooltip: "3D", value: "preserve-3d" },
          ],
        },
      ]),
    ],
    componentName: "dataEditor",
    dialogLabel: "Adjust Transform",
    hideLabel: true,
    key: "transform",
    label: "Transform",
    useParentProjection: true,
  } as DataEditorField,
};
