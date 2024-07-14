/* eslint-disable perfectionist/sort-objects */
import { CSSWideKeywords } from "./CSSMetadata";
import { createSelectOptions, type TextFieldOptionsField } from "./FieldType";
import { sizeTypes } from "./constants";

export const PositionSection = {
  top: {
    component: "textFieldOptions",
    isLabelOnTop: true,
    label: "Top",
    name: "top",
    options: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,
  left: {
    component: "textFieldOptions",
    isLabelOnTop: true,
    label: "Left",
    name: "left",
    options: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,
  right: {
    component: "textFieldOptions",
    isLabelOnTop: true,
    label: "Right",
    name: "right",
    options: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,
  bottom: {
    component: "textFieldOptions",
    isLabelOnTop: true,
    label: "Bottom",
    name: "bottom",
    options: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,
  position: createSelectOptions("position", "Position", ["static", "relative", "absolute", "fixed", "sticky", ...CSSWideKeywords]),
  zIndex: {
    component: "textFieldOptions",
    isLabelOnTop: true,
    label: "Z-Index",
    name: "z-index",
    options: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,
};
