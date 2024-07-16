
import { type TextFieldOptionsField, createGridOptions } from "./FieldType";
import { sizeTypes } from "./constants";

export const DimentionSection = {
  width: createGridOptions("grid", "Dimention", [
    {
      component: "textFieldOptions",
      isLabelOnTop: true,
      label: "Width",
      name: "width",
      options: sizeTypes,
      type: "number",
    } as TextFieldOptionsField,
    {
      component: "textFieldOptions",
      isLabelOnTop: true,
      label: "Min width",
      name: "min-width",
      options: sizeTypes,
      type: "number",
    } as TextFieldOptionsField,
    {
      component: "textFieldOptions",
      isLabelOnTop: true,
      label: "Max width",
      name: "max-width",
      options: sizeTypes,
      type: "number",
    } as TextFieldOptionsField,
  ]),
  // eslint-disable-next-line perfectionist/sort-objects
  height: createGridOptions("grid", "Dimention", [
    {
      component: "textFieldOptions",
      isLabelOnTop: true,
      label: "Height",
      name: "height",
      options: sizeTypes,
      type: "number",
    } as TextFieldOptionsField,
    {
      component: "textFieldOptions",
      isLabelOnTop: true,
      label: "Min height",
      name: "min-height",
      options: sizeTypes,
      type: "number",
    } as TextFieldOptionsField,
    {
      component: "textFieldOptions",
      isLabelOnTop: true,
      label: "Max height",
      name: "max-height",
      options: sizeTypes,
      type: "number",
    } as TextFieldOptionsField,
  ]),
};
