 

import type {
  ColorPickerField,
  DataEditorField,
  TextFieldOptionsField,
  ToggleField,
} from "./FieldType";

import { createGridOptions } from "./FieldType";
import { sizeTypes } from "./constants";

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
          options: sizeTypes,
          type: "number",
        } as TextFieldOptionsField,
        {
          componentName: "textFieldOptions",
          isLabelOnTop: true,
          label: "Y Offset",
          name: "offset-y",
          options: sizeTypes,
          type: "number",
        } as TextFieldOptionsField,
        {
          componentName: "textFieldOptions",
          isLabelOnTop: true,
          label: "Blur",
          name: "blur-radius",
          options: sizeTypes,
          type: "number",
        } as TextFieldOptionsField,
        {
          componentName: "textFieldOptions",
          isLabelOnTop: true,
          label: "Spread",
          name: "spread",
          options: sizeTypes,
          type: "number",
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
