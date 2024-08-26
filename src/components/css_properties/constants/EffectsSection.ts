/* eslint-disable perfectionist/sort-objects */

import type {
  DataEditorField,
  SelectField,
  TextFieldOptionsField,
  ToggleField,
} from "./FieldSchemaType";

import { sizeTypes } from "./csseditor_constants";
import { extraPropertyValues } from "./CSSMetadata";
import { createGridOptions } from "./FieldSchemaType";
import { Icons } from "./Icons";

export const EffectsSection = {
  filter: {
    children: [
      createGridOptions("Shadow Grid", "Filter", [
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
          componentName: "string",
          isLabelOnTop: true,
          label: "Value",
          name: "value",
          unitOptions: sizeTypes,
          type: "number",
        } as TextFieldOptionsField,
      ]),
    ],
    componentName: "dataEditor",
    dialogLabel: "Adjust Filter",
    fallback: "No Filter Effects",
    label: "Filter",
    name: "filter",
    useParentProjection: true,
    hideLabel: true,
  } as DataEditorField,

  backdropFilter: {
    children: [
      createGridOptions("Shadow Grid", "Backdrop Filter", [
        {
          componentName: "select",
          isLabelOnTop: true,
          label: "Type",
          name: "type",
          options: extraPropertyValues["backdrop-filter"].values,
        } as SelectField,
        {
          componentName: "string",
          isLabelOnTop: true,
          label: "Value",
          name: "value",
          unitOptions: sizeTypes,
          type: "number",
        } as TextFieldOptionsField,
      ]),
    ],
    componentName: "dataEditor",
    dialogLabel: "Backdrop Filter",
    label: "Backdrop Filter",
    name: "backdrop-filter",
    useParentProjection: true,
    hideLabel: true,
  } as DataEditorField,

  backfaceVisibility: {
    componentName: "toggleButton",
    isLabelOnTop: true,
    label: "Backface",
    name: "backface-visibility",
    options: [
      { icon: Icons.visibility.yes, key: "Visible", value: "visible" },
      { icon: Icons.visibility.no, key: "Hidden", value: "hidden" },
    ],
  } as ToggleField,

  perspective: {
    componentName: "string",
    isLabelOnTop: true,
    label: "Perspective",
    name: "perspective",
    unitOptions: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,
};
