/* eslint-disable perfectionist/sort-objects */


import { defaultPixelSizeTypes } from "./csseditor_constants";
import {
  type ColorPickerField,
  createGridOptions,
  type DataEditorField,
  type TextFieldOptionsField,
  type ToggleField,
} from "./FieldType";

export const BoxShadow = {
  boxShadow: {
    children: {
      data: {
        componentName: "colorPicker",
        info: "box-shadow",
        isLabelOnTop: true,
        label: "Shadow Color",
        name: "color",
      } as ColorPickerField,
      shadow: createGridOptions("grid", "Shadow", [
        {
          componentName: "textFieldOptions",
          hashName: "length",
          info: "box-shadow",
          isLabelOnTop: true,
          label: "X Offset",
          name: "offset-x",
          unitOptions: defaultPixelSizeTypes,
          type: "number",
        } as TextFieldOptionsField,
        {
          componentName: "textFieldOptions",
          hashName: "length",
          info: "box-shadow",
          isLabelOnTop: true,
          label: "Y Offset",
          name: "offset-y",
          unitOptions: defaultPixelSizeTypes,
          type: "number",
        } as TextFieldOptionsField,
        {
          componentName: "textFieldOptions",
          hashName: "length",
          info: "box-shadow",
          isLabelOnTop: true,
          label: "Blur",
          name: "blur",
          unitOptions: defaultPixelSizeTypes,
          type: "number",
        } as TextFieldOptionsField,
        {
          componentName: "textFieldOptions",
          hashName: "length",
          info: "box-shadow",
          isLabelOnTop: true,
          label: "Spread",
          name: "spread",
          unitOptions: defaultPixelSizeTypes,
          type: "number",
        } as TextFieldOptionsField,
      ]),
      inset: {
        componentName: "toggleButton",
        info: "box-shadow",
        label: "",
        name: "inset",
        options: [
          { key: "Outside", value: "" },
          { key: "Inside", value: "inset" },
        ],
      } as ToggleField,
    },
    componentName: "dataEditor",
    dialogLabel: "Adjust Shadow",
    fallback: "No Shadow Effects",
    label: "Box Shadow",
    name: "box-shadow",
  } as DataEditorField,
};
