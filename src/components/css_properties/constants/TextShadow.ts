import type {
  ColorPickerField,
  DataEditorField,
  TextFieldOptionsField,
} from "./FieldSchemaType";

import { defaultPixelSizeTypes } from "./csseditor_constants";
import { createGridOptions } from "./FieldSchemaType";

export const TextShadow = {
  textShadow: {
    children: [
      {
        componentName: "colorPicker",
        hashName: "color",
        info: "text-shadow",
        isLabelOnTop: true,
        label: "Shadow Color",
        name: "color",
      } as ColorPickerField,
      createGridOptions("grid", "Shadow", [
        {
          componentName: "string",
          hashName: "offset-x_offset-y",
          info: "text-shadow",
          isLabelOnTop: true,
          label: "X Offset",
          name: "offset-x",
          type: "number",
          unitOptions: defaultPixelSizeTypes,
        } as TextFieldOptionsField,
        {
          componentName: "string",
          hashName: "offset-x_offset-y",
          info: "text-shadow",
          isLabelOnTop: true,
          label: "Y Offset",
          name: "offset-y",
          type: "number",
          unitOptions: defaultPixelSizeTypes,
        } as TextFieldOptionsField,
        {
          componentName: "string",
          hashName: "blur-radius",
          info: "text-shadow",
          isLabelOnTop: true,
          label: "Blur",
          name: "blur-radius",
          type: "number",
          unitOptions: defaultPixelSizeTypes,
        } as TextFieldOptionsField,
      ]),
    ],
    componentName: "dataEditor",
    dialogLabel: "Adjust Shadow",
    fallback: "No Shadow Effects",
    hideLabel: true,
    label: "Text Shadow",
    name: "text-shadow",
    useParentProjection: true,
  } as DataEditorField,
};
