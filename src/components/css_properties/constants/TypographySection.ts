/* eslint-disable perfectionist/sort-objects */
import { CSSWideKeywords, extraPropertyValues } from "./CSSMetadata";
import type {
  ColorPickerField,
  SelectField,
  TextFieldOptionsField,
} from "./FieldType";

import { createGridOptions } from "./FieldType";
import { createSelectOptions } from "./FieldType";
import { sizeTypes } from "./constants";

export const TypographySection = {
  fontFamily: createSelectOptions(
    "font-family",
    "Font family",
    [
      ...extraPropertyValues["font-family"].values,
      "Arial Black",
      "Brush Script MT",
      "Comic Sans MS",
      "Courier New",
      "Georgia",
      "Helvetica",
      "Impact",
      "Lucida Sans Unicode",
      "Tahoma",
      "Times New Roman",
      "Trebuchet MS",
      "Verdana",
    ],
    true,
  ),
  fontSize: {
    component: "textFieldOptions",
    isLabelOnTop: true,
    label: "Size",
    name: "font-size",
    options: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,

  lineHeight: {
    component: "textFieldOptions",
    isLabelOnTop: true,
    label: "Line height",
    name: "line-height",
    options: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,
  colorPicker: {
    component: "colorPicker",
    isLabelOnTop: true,
    label: "Color",
    name: "color",
  } as ColorPickerField,
  fontWeight: {
    component: "select",
    isLabelOnTop: true,
    label: "Weight",
    name: "font-weight",
    options: extraPropertyValues["font-weight"].values,
  } as SelectField,
  letterSpacing:{
    component: "textFieldOptions",
    isLabelOnTop: true,
    label: "Spacing",
    name: "letter-spacing",
    options: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,
  textIndent: {
    component: "textFieldOptions",
    isLabelOnTop: true,
    label: "Indent",
    name: "text-indent",
    options: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,
  fontStyle: {
    component: "select",
    isLabelOnTop: true,
    label: "Style",
    name: "font-style",
    options: [
      { label: "Normal", value: "normal" },
      { label: "Italic", value: "italic" },
      // { label: "Oblique", value: "oblique" }, // TODO: add support for degree: oblique 40deg;
      ...CSSWideKeywords
    ],
  } as SelectField,
  fontVariant: {
    component: "select",
    isLabelOnTop: true,
    label: "Variant",
    name: "font-variant",
    options: extraPropertyValues["font-variant"].values,
  } as SelectField,
  textDecoration: {
    component: "select",
    isLabelOnTop: true,
    label: "Decoration",
    name: "text-decoration",
    options: extraPropertyValues["text-decoration"].values,
  } as SelectField,
  textTransform: {
    component: "select",
    isLabelOnTop: true,
    label: "Transform",
    name: "text-transform",
    options: ["none", "capitalize", "uppercase", "lowercase"],
  } as SelectField,
  textAlign: {
    component: "select",
    isLabelOnTop: true,
    label: "Align",
    name: "text-align",
    options: ["left", "center", "right", "justify"],
  } as SelectField,
  // add Writing mode
  whiteSpace: createSelectOptions(
    "white-space",
    "White space",
    extraPropertyValues["white-space"].values,
    true,
  ),
  wordBreak: createSelectOptions(
    "word-break",
    "Word break",
    ["normal", "break-all", "keep-all", "break-word", ...CSSWideKeywords],
    true,
  ),
  direction: {
    component: "select",
    isLabelOnTop: true,
    label: "Direction",
    name: "direction",
    options: [
      { label: "RTL", value: "rtl" },
      { label: "LTR", value: "ltr" },
    ],
  } as SelectField,

};
