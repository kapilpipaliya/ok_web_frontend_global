/* eslint-disable perfectionist/sort-objects */
import type {
  ColorPickerField,
  SelectField,
  TextFieldOptionsField,
} from "../FieldSchemaType";
import { createSelectOptions } from "../FieldSchemaType";

import { sizeTypes } from "../csseditor_constants";
import { CSSWideKeywords, extraPropertyValues } from "./CSSMetadata";

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
    componentName: "string",
    label: "Size",
    key: "font-size",
    unitOptions: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,

  lineHeight: {
    componentName: "string",
    label: "Line height",
    key: "line-height",
    unitOptions: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,
  colorPicker: {
    componentName: "colorPicker",
    label: "Color",
    key: "color",
  } as ColorPickerField,
  fontWeight: {
    componentName: "select",
    label: "Weight",
    key: "font-weight",
    options: extraPropertyValues["font-weight"].values,
  } as SelectField,
  letterSpacing: {
    componentName: "string",
    label: "Spacing",
    key: "letter-spacing",
    unitOptions: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,
  textIndent: {
    componentName: "string",
    label: "Indent",
    key: "text-indent",
    unitOptions: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,
  fontStyle: {
    componentName: "select",
    label: "Style",
    key: "font-style",
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
    key: "font-variant",
    options: extraPropertyValues["font-variant"].values,
  } as SelectField,
  textDecoration: {
    componentName: "select",
    label: "Decoration",
    key: "text-decoration",
    options: extraPropertyValues["text-decoration"].values,
  } as SelectField,
  textTransform: {
    componentName: "select",
    label: "Transform",
    key: "text-transform",
    options: ["none", "capitalize", "uppercase", "lowercase"],
  } as SelectField,
  textAlign: {
    componentName: "select",
    label: "Align",
    key: "text-align",
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
    key: "direction",
    options: [
      { label: "RTL", value: "rtl" },
      { label: "LTR", value: "ltr" },
    ],
  } as SelectField,
};
