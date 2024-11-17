/* eslint-disable perfectionist/sort-objects */

import { defaultPixelSizeTypes } from "../csseditor_constants";
import {
  type ColorPickerField,
  createGridOptions,
  type DataEditorField,
  type TextFieldOptionsField,
  type ToggleField,
} from "../FieldSchemaType";

export const BoxShadow = {
  boxShadow: {
    children: [
      {
        componentName: "colorPicker",
        info: "box-shadow",
        isLabelOnTop: true,
        hashName: "color",
        label: "Shadow Color",
        key: "color",
      } as ColorPickerField,
      createGridOptions("grid", "Shadow", [
        {
          componentName: "string",
          hashName: "length",
          info: "box-shadow",
          isLabelOnTop: true,
          label: "X Offset",
          key: "offset-x",
          unitOptions: defaultPixelSizeTypes,
          type: "number",
        } as TextFieldOptionsField,
        {
          componentName: "string",
          hashName: "length",
          info: "box-shadow",
          isLabelOnTop: true,
          label: "Y Offset",
          key: "offset-y",
          unitOptions: defaultPixelSizeTypes,
          type: "number",
        } as TextFieldOptionsField,
        {
          componentName: "string",
          hashName: "length",
          info: "box-shadow",
          isLabelOnTop: true,
          label: "Blur",
          key: "blur-radius",
          unitOptions: defaultPixelSizeTypes,
          type: "number",
        } as TextFieldOptionsField,
        {
          componentName: "string",
          hashName: "length",
          info: "box-shadow",
          isLabelOnTop: true,
          label: "Spread",
          key: "spread",
          unitOptions: defaultPixelSizeTypes,
          type: "number",
        } as TextFieldOptionsField,
      ]),
      {
        componentName: "toggleButton",
        info: "box-shadow",
        label: "",
        key: "inset",
        options: [
          { key: "Outside", value: "" },
          { key: "Inside", value: "inset" },
        ],
      } as ToggleField,
    ],
    componentName: "dataEditor",
    dialogLabel: "Adjust Shadow",
    fallback: "No Shadow Effects",
    label: "Box Shadow",
    key: "box-shadow",
    useParentProjection: true,
    hideLabel: true,
  } as DataEditorField,
};
