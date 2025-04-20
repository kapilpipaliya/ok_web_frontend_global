/* eslint-disable perfectionist/sort-objects */

import type {
  DataEditorField,
  SelectField,
  TextFieldOptionsField,
  ToggleField,
} from "../FieldSchemaType";
import { createGridOptions } from "../FieldSchemaType";

import { sizeTypes } from "../csseditor_constants";
import { Icons } from "../Icons";
import { extraPropertyValues } from "./CSSMetadata";

export const EffectsSection = {
  filter: {
    children: [
      createGridOptions("Shadow Grid", "Filter", [
        {
          componentName: "select",
          isLabelOnTop: true,
          label: "Type",
          key: "type",
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
          key: "value",
          unitOptions: sizeTypes,
          type: "number",
        } as TextFieldOptionsField,
      ]),
    ],
    componentName: "dataEditor",
    dialogLabel: "Adjust Filter",
    fallback: "No Filter Effects",
    label: "Filter",
    key: "filter",
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
          key: "type",
          options: extraPropertyValues["backdrop-filter"].values,
        } as SelectField,
        {
          componentName: "string",
          isLabelOnTop: true,
          label: "Value",
          key: "value",
          unitOptions: sizeTypes,
          type: "number",
        } as TextFieldOptionsField,
      ]),
    ],
    componentName: "dataEditor",
    dialogLabel: "Backdrop Filter",
    label: "Backdrop Filter",
    key: "backdrop-filter",
    useParentProjection: true,
    hideLabel: true,
  } as DataEditorField,

  backfaceVisibility: {
    componentName: "toggleButton",
    isLabelOnTop: true,
    label: "Backface",
    key: "backface-visibility",
    options: [
      { icon: Icons.visibility.yes, key: "Visible", value: "visible" },
      { icon: Icons.visibility.no, key: "Hidden", value: "hidden" },
    ],
  } as ToggleField,

  perspective: {
    componentName: "string",
    isLabelOnTop: true,
    label: "Perspective",
    key: "perspective",
    unitOptions: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,
};
