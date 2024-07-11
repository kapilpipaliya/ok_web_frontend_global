import type {
  ColorPickerField,
  SelectField,
  TextFieldOptionsField,
} from "./FieldType";

import { createGridOptions } from "./FieldType";
import { createSelectOptions } from "./FieldType";
import { sizeTypes } from "./constants";

export const TypographySection = {
  colorPicker: {
    component: "colorPicker",
    isLabelOnTop: true,
    label: "Color",
    name: "color",
  } as ColorPickerField,
  fontFamily: createSelectOptions(
    "font-family",
    "Font",
    [
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
  typography: createGridOptions("size Grid", "Typography", [
    {
      component: "textFieldOptions",
      isLabelOnTop: true,
      label: "Size",
      name: "font-size",
      options: sizeTypes,
      type: "number",
    } as TextFieldOptionsField,
    {
      component: "select",
      isLabelOnTop: true,
      label: "Weight",
      name: "font-weight",
      options: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    } as SelectField,
    {
      component: "textFieldOptions",
      isLabelOnTop: true,
      label: "Line height",
      name: "line-height",
      options: sizeTypes,
      type: "number",
    } as TextFieldOptionsField,
    {
      component: "textFieldOptions",
      isLabelOnTop: true,
      label: "Spacing",
      name: "letter-spacing",
      options: sizeTypes,
      type: "number",
    } as TextFieldOptionsField,
    {
      component: "select",
      isLabelOnTop: true,
      label: "Align",
      name: "text-align",
      options: ["left", "center", "right", "justify"],
    } as SelectField,
    {
      component: "select",
      isLabelOnTop: true,
      label: "Decoration",
      name: "text-decoration",
      options: ["none", "underline", "overline", "line through"],
    } as SelectField,
    {
      component: "select",
      isLabelOnTop: true,
      label: "Transform",
      name: "text-transform",
      options: ["none", "capitalize", "uppercase", "lowercase"],
    } as SelectField,
    {
      component: "select",
      isLabelOnTop: true,
      label: "Direction",
      name: "direction",
      options: [
        { label: "RTL", value: "rtl" },
        { label: "LTR", value: "ltr" },
      ],
    } as SelectField,
  ]),
  whiteSpace: createSelectOptions(
    "white-space",
    "Breaking",
    [
      { label: "Normal", value: "normal" },
      { label: "No Wrap", value: "nowrap" },
      { label: "Pre", value: "pre" },
      { label: "Pre Wrap", value: "pre-wrap" },
      { label: "Pre Line", value: "pre-line" },
      { label: "Break Spaces", value: "break-spaces" },
    ],
    true,
  ),
};
