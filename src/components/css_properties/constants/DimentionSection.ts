/* eslint-disable perfectionist/sort-objects */
import type { TextFieldOptionsField } from "./FieldType";

import { sizeTypes } from "./constants";

export const DimentionSection = {
  width: {
    component: "textFieldOptions",
    isLabelOnTop: true,
    label: "Width",
    name: "width",
    options: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,
  minWidth: {
    component: "textFieldOptions",
    isLabelOnTop: true,
    label: "Min width",
    name: "min-width",
    options: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,
  maxWidth: {
    component: "textFieldOptions",
    isLabelOnTop: true,
    label: "Max width",
    name: "max-width",
    options: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,

  height: {
    component: "textFieldOptions",
    isLabelOnTop: true,
    label: "Height",
    name: "height",
    options: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,
  minHeight: {
    component: "textFieldOptions",
    isLabelOnTop: true,
    label: "Min height",
    name: "min-height",
    options: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,
  maxHeight: {
    component: "textFieldOptions",
    isLabelOnTop: true,
    label: "Max height",
    name: "max-height",
    options: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,
  
};
