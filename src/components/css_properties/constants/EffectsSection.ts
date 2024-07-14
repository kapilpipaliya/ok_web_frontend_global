/* eslint-disable perfectionist/sort-objects */
import { createSignal } from "solid-js";

import type {
  DataEditorField,
  SelectField,
  TextFieldOptionsField,
  ToggleField,
} from "./FieldType";

import { extraPropertyValues } from "./CSSMetadata";
import { createGridOptions, } from "./FieldType";
import { sizeTypes } from "./constants";

export const EffectsSection = {
  filter: {
    children: {
      shadow: createGridOptions("Shadow Grid", "Filter", [
        {
          component: "select",
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
          component: "textFieldOptions",
          isLabelOnTop: true,
          label: "Value",
          name: "value",
          options: sizeTypes,
          type: "number",
        } as TextFieldOptionsField,
      ]),
    },
    component: "dataEditor",
    dialogLabel: "Adjust Filter",
    fallback: "No Filter Effects",
    label: "Filter",
    name: "filter",
    openMenu: createSignal(null),
  } as DataEditorField,

  backdropFilter: {
    children: {
      shadow: createGridOptions("Shadow Grid", "Backdrop Filter", [
        {
          component: "select",
          isLabelOnTop: true,
          label: "Type",
          name: "type",
          options: extraPropertyValues["backdrop-filter"].values,
        } as SelectField,
        {
          component: "textFieldOptions",
          isLabelOnTop: true,
          label: "Value",
          name: "value",
          options: sizeTypes,
          type: "number",
        } as TextFieldOptionsField,
      ]),
    },
    component: "dataEditor",
    dialogLabel: "Backdrop Filter",
    label: "Backdrop Filter",
    name: "backdrop-filter",
    openMenu: createSignal(null),
  } as DataEditorField,

  

  backfaceVisibility: {
    component: "toggleButton",
    isLabelOnTop: true,
    label: "Backface",
    name: "backface-visibility",
    options: [
      { key: "Visible", value: "visible" },
      { key: "Hidden", value: "hidden" },
    ],
  } as ToggleField,


  perspective: {
    component: "textFieldOptions",
    isLabelOnTop: true,
    label: "Perspective",
    name: "perspective",
    options: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,

};
