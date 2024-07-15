/* eslint-disable perfectionist/sort-objects */


import {
  type ColorPickerField,
  type DataEditorField,
  type TextFieldOptionsField,
  type ToggleField,
  createGridOptions,
} from "./FieldType";
import { sizeTypes } from "./constants";

export const BoxShadow = {
  boxShadow: {
    children: {
      data: {
        component: "colorPicker",
        isLabelOnTop: true,
        label: "Shadow Color",
        name: "color",
      } as ColorPickerField,
      shadow: createGridOptions("grid", "Shadow", [
        {
          component: "textFieldOptions",
          isLabelOnTop: true,
          label: "X Offset",
          name: "x-offset",
          options: sizeTypes,
          type: "number",
        } as TextFieldOptionsField,
        {
          component: "textFieldOptions",
          isLabelOnTop: true,
          label: "Y Offset",
          name: "y-offset",
          options: sizeTypes,
          type: "number",
        } as TextFieldOptionsField,
        {
          component: "textFieldOptions",
          isLabelOnTop: true,
          label: "Blur",
          name: "blur",
          options: sizeTypes,
          type: "number",
        } as TextFieldOptionsField,
        {
          component: "textFieldOptions",
          isLabelOnTop: true,
          label: "Spread",
          name: "spread",
          options: sizeTypes,
          type: "number",
        } as TextFieldOptionsField,
      ]),
      inset: {
        component: "toggleButton",
        label: "",
        name: "inset",
        options: [
          { key: "Outside", value: "" },
          { key: "Inside", value: "inset" },
        ],
      } as ToggleField,
    },
    component: "dataEditor",
    dialogLabel: "Adjust Shadow",
    fallback: "No Shadow Effects",
    label: "Box Shadow",
    name: "box-shadow",
  } as DataEditorField,
};
