/* eslint-disable perfectionist/sort-objects */

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
        component: "colorPicker",
        isLabelOnTop: true,
        label: "Shadow Color",
        name: "color",
      } as ColorPickerField,
      shadow: createGridOptions("grid", "Shadow", [
        {
          component: "textFieldOptions",
          isAddToClass: false,
          isLabelOnTop: true,
          label: "X Offset",
          name: "x-offset",
          options: sizeTypes,
          type: "number",
        } as TextFieldOptionsField,
        {
          component: "textFieldOptions",
          isAddToClass: false,
          isLabelOnTop: true,
          label: "Y Offset",
          name: "y-offset",
          options: sizeTypes,
          type: "number",
        } as TextFieldOptionsField,
        {
          component: "textFieldOptions",
          isAddToClass: false,
          isLabelOnTop: true,
          label: "Blur",
          name: "blur",
          options: sizeTypes,
          type: "number",
        } as TextFieldOptionsField,
        {
          component: "textFieldOptions",
          isAddToClass: false,
          isLabelOnTop: true,
          label: "Spread",
          name: "spread",
          options: sizeTypes,
          type: "number",
        },
      ]),
      style: {
        component: "toggleButton",
        label: "",
        name: "type",
        options: [
          { key: "Outside", value: "" },
          { key: "Inside", value: "inset" },
        ],
      } as ToggleField,
    },
    component: "dataEditor",
    dialogLabel: "Adjust Shadow",
    fallback: "No Shadow Effects",
    label: "Text Shadow",
    name: "text-shadow",
  } as DataEditorField,
};
