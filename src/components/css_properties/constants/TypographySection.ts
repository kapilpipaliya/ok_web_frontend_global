import { sizeTypes } from "../context";
import { createGridOptions } from "./createGridOptions";
import { createSelectOptions } from "./createSelectOptions";

export const TypographySection = {
  colorPicker: {
    component: "colorPicker",
    isLabelOnTop: true,
    label: "Color",
    name: "color",
  },
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
    true
  ),
  typography: createGridOptions("size Grid", "Typography", [
    {
      component: "textFieldOptions",
      isLabelOnTop: true,
      label: "Size",
      name: "font-size",
      options: sizeTypes,
      type: "number",
    },
    {
      component: "select",
      isLabelOnTop: true,
      label: "Weight",
      name: "font-weight",
      options: [
        "100",
        "200",
        "300",
        "400",
        "500",
        "600",
        "700",
        "800",
        "900",
      ],
    },
    {
      component: "textFieldOptions",
      isLabelOnTop: true,
      label: "Line height",
      name: "line-height",
      options: sizeTypes,
      type: "number",
    },
    {
      component: "textFieldOptions",
      isLabelOnTop: true,
      label: "Spacing",
      name: "letter-spacing",
      options: sizeTypes,
      type: "number",
    },
    {
      component: "select",
      isLabelOnTop: true,
      label: "Align",
      name: "text-align",
      options: ["left", "center", "right", "justify"],
    },
    {
      component: "select",
      isLabelOnTop: true,
      label: "Decoration",
      name: "text-decoration",
      options: ["none", "underline", "overline", "line through"],
    },
    {
      component: "select",
      isLabelOnTop: true,
      label: "Transform",
      name: "text-transform",
      options: ["none", "capitalize", "uppercase", "lowercase"],
    },
    {
      component: "select",
      isLabelOnTop: true,
      label: "Direction",
      name: "direction",
      options: [
        { label: "RTL", value: "rtl" },
        { label: "LTR", value: "ltr" },
      ],
    },
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
    true
  ),
};
