import type {
  ColorPickerField,
  DataEditorField,
  TextFieldOptionsField,
} from "../FieldSchemaType";
import { createGridOptions } from "../FieldSchemaType";

import { defaultPixelSizeTypes } from "../csseditor_constants";

export const TextShadow = {
  textShadow: {
    children: [
      {
        componentName: "colorPicker",
        hashName: "color",
        info: "text-shadow",
        isLabelOnTop: true,
        key: "color",
        label: "Shadow Color",
      } as ColorPickerField,
      createGridOptions("grid", "Shadow", [
        {
          componentName: "string",
          hashName: "offset-x_offset-y",
          info: "text-shadow",
          isLabelOnTop: true,
          key: "offset-x",
          label: "X Offset",
          type: "number",
          unitOptions: defaultPixelSizeTypes,
        } as TextFieldOptionsField,
        {
          componentName: "string",
          hashName: "offset-x_offset-y",
          info: "text-shadow",
          isLabelOnTop: true,
          key: "offset-y",
          label: "Y Offset",
          type: "number",
          unitOptions: defaultPixelSizeTypes,
        } as TextFieldOptionsField,
        {
          componentName: "string",
          hashName: "blur-radius",
          info: "text-shadow",
          isLabelOnTop: true,
          key: "blur-radius",
          label: "Blur",
          type: "number",
          unitOptions: defaultPixelSizeTypes,
        } as TextFieldOptionsField,
      ]),
    ],
    componentName: "dataEditor",
    dialogLabel: "Adjust Shadow",
    fallback: "No Shadow Effects",
    hideLabel: true,
    key: "text-shadow",
    label: "Text Shadow",
    useParentProjection: true,
  } as DataEditorField,
};
