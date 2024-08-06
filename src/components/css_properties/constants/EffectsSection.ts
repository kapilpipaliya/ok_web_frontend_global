/* eslint-disable perfectionist/sort-objects */

import type {
  DataEditorField,
  SelectField,
  TextFieldOptionsField,
  ToggleField,
} from "./FieldType";

import { sizeTypes } from "./csseditor_constants";
import { extraPropertyValues } from "./CSSMetadata";
import { createGridOptions, } from "./FieldType";

export const EffectsSection = {
  filter: {
    children: {
      shadow: createGridOptions("Shadow Grid", "Filter", [
        {
          componentName: "select",
          isLabelOnTop: true,
          label: "Type",
          name: "type",
          options: [
            "blur",
            "brightness",
            "contrast",
            "grayscale",
            "hue-rotate",
            "invert",
            "saturate",
            "sepia",
          ],
        },
        {
          componentName: "textFieldOptions",
          isLabelOnTop: true,
          label: "Value",
          name: "value",
          unitOptions: sizeTypes,
          type: "number",
        } as TextFieldOptionsField,
      ]),
    },
    componentName: "dataEditor",
    dialogLabel: "Adjust Filter",
    fallback: "No Filter Effects",
    label: "Filter",
    name: "filter",
  } as DataEditorField,

  backdropFilter: {
    children: {
      shadow: createGridOptions("Shadow Grid", "Backdrop Filter", [
        {
          componentName: "select",
          isLabelOnTop: true,
          label: "Type",
          name: "type",
          options: extraPropertyValues["backdrop-filter"].values,
        } as SelectField,
        {
          componentName: "textFieldOptions",
          isLabelOnTop: true,
          label: "Value",
          name: "value",
          unitOptions: sizeTypes,
          type: "number",
        } as TextFieldOptionsField,
      ]),
    },
    componentName: "dataEditor",
    dialogLabel: "Backdrop Filter",
    label: "Backdrop Filter",
    name: "backdrop-filter",
  } as DataEditorField,

  

  backfaceVisibility: {
    componentName: "toggleButton",
    isLabelOnTop: true,
    label: "Backface",
    name: "backface-visibility",
    options: [
      { key: "Visible", value: "visible" },
      { key: "Hidden", value: "hidden" },
    ],
  } as ToggleField,


  perspective: {
    componentName: "textFieldOptions",
    isLabelOnTop: true,
    label: "Perspective",
    name: "perspective",
    unitOptions: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,

};
