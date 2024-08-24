/* eslint-disable perfectionist/sort-objects */
import type {
  ColorPickerField,
  SelectField,
  TextFieldOptionsField,
} from "./FieldType";

import { sizeTypes } from "./csseditor_constants";
import { CSSWideKeywords, extraPropertyValues } from "./CSSMetadata";
import { createSelectOptions } from "./FieldType";

export const TypographySection = {
  fontFamily: createSelectOptions("font-family", "Font family", [
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
  ]),
  fontSize: {
    componentName: "textFieldOptions",
    label: "Size",
    name: "font-size",
    unitOptions: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,

  lineHeight: {
    componentName: "textFieldOptions",
    label: "Line height",
    name: "line-height",
    unitOptions: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,
  colorPicker: {
    componentName: "colorPicker",
    label: "Color",
    name: "color",
  } as ColorPickerField,
  fontWeight: {
    componentName: "select",
    label: "Weight",
    name: "font-weight",
    options: extraPropertyValues["font-weight"].values,
  } as SelectField,
  letterSpacing: {
    componentName: "textFieldOptions",
    label: "Spacing",
    name: "letter-spacing",
    unitOptions: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,
  textIndent: {
    componentName: "textFieldOptions",
    label: "Indent",
    name: "text-indent",
    unitOptions: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,
  fontStyle: {
    componentName: "select",
    label: "Style",
    name: "font-style",
    options: [
      { label: "Normal", value: "normal" },
      { label: "Italic", value: "italic" },
      // { label: "Oblique", value: "oblique" }, // TODO: add support for degree: oblique 40deg;
      ...CSSWideKeywords,
    ],
  } as SelectField,
  fontVariant: {
    componentName: "select",
    label: "Variant",
    name: "font-variant",
    options: extraPropertyValues["font-variant"].values,
  } as SelectField,
  textDecoration: {
    componentName: "select",
    label: "Decoration",
    name: "text-decoration",
    options: extraPropertyValues["text-decoration"].values,
  } as SelectField,
  textTransform: {
    componentName: "select",
    label: "Transform",
    name: "text-transform",
    options: ["none", "capitalize", "uppercase", "lowercase"],
  } as SelectField,
  textAlign: {
    componentName: "select",
    label: "Align",
    name: "text-align",
    options: ["left", "center", "right", "justify"],
  } as SelectField,
  // add Writing mode
  whiteSpace: createSelectOptions(
    "white-space",
    "White space",
    extraPropertyValues["white-space"].values,
  ),
  wordBreak: createSelectOptions("word-break", "Word break", [
    "normal",
    "break-all",
    "keep-all",
    "break-word",
    ...CSSWideKeywords,
  ]),
  direction: {
    componentName: "select",
    label: "Direction",
    name: "direction",
    options: [
      { label: "RTL", value: "rtl" },
      { label: "LTR", value: "ltr" },
    ],
  } as SelectField,
};
