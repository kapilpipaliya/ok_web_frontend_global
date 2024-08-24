import type {
  ColorPickerField,
  DataEditorField,
  TextFieldOptionsField,
} from "./FieldSchemaType";

import { defaultPixelSizeTypes } from "./csseditor_constants";
import { createGridOptions } from "./FieldSchemaType";

export const TextShadow = {
  textShadow: {
    children: {
      data: {
        componentName: "colorPicker",
        isLabelOnTop: true,
        label: "Shadow Color",
        name: "color",
      } as ColorPickerField,
      shadow: createGridOptions("grid", "Shadow", [
        {
          componentName: "textFieldOptions",
          isLabelOnTop: true,
          label: "X Offset",
          name: "offset-x",
          type: "number",
          unitOptions: defaultPixelSizeTypes,
        } as TextFieldOptionsField,
        {
          componentName: "textFieldOptions",
          isLabelOnTop: true,
          label: "Y Offset",
          name: "offset-y",
          type: "number",
          unitOptions: defaultPixelSizeTypes,
        } as TextFieldOptionsField,
        {
          componentName: "textFieldOptions",
          isLabelOnTop: true,
          label: "Blur",
          name: "blur-radius",
          type: "number",
          unitOptions: defaultPixelSizeTypes,
        } as TextFieldOptionsField,
        {
          componentName: "textFieldOptions",
          isLabelOnTop: true,
          label: "Spread",
          name: "spread",
          type: "number",
          unitOptions: defaultPixelSizeTypes,
        } as TextFieldOptionsField,
      ]),
    },
    componentName: "dataEditor",
    dialogLabel: "Adjust Shadow",
    fallback: "No Shadow Effects",
    label: "Text Shadow",
    name: "text-shadow",
  } as DataEditorField,
};
