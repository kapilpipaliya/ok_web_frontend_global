
import { sizeTypes } from "./csseditor_constants";
import { createGridOptions, type TextFieldOptionsField } from "./FieldType";

export const DimentionSection = {
  width: createGridOptions("grid", "Dimention", [
    {
      componentName: "textFieldOptions",
      isLabelOnTop: true,
      label: "Width",
      name: "width",
      type: "number",
      unitOptions: sizeTypes,
    } as TextFieldOptionsField,
    {
      componentName: "textFieldOptions",
      isLabelOnTop: true,
      label: "Min width",
      name: "min-width",
      type: "number",
      unitOptions: sizeTypes,
    } as TextFieldOptionsField,
    {
      componentName: "textFieldOptions",
      isLabelOnTop: true,
      label: "Max width",
      name: "max-width",
      type: "number",
      unitOptions: sizeTypes,
    } as TextFieldOptionsField,
  ]),
  // eslint-disable-next-line perfectionist/sort-objects
  height: createGridOptions("grid", "Dimention", [
    {
      componentName: "textFieldOptions",
      isLabelOnTop: true,
      label: "Height",
      name: "height",
      type: "number",
      unitOptions: sizeTypes,
    } as TextFieldOptionsField,
    {
      componentName: "textFieldOptions",
      isLabelOnTop: true,
      label: "Min height",
      name: "min-height",
      type: "number",
      unitOptions: sizeTypes,
    } as TextFieldOptionsField,
    {
      componentName: "textFieldOptions",
      isLabelOnTop: true,
      label: "Max height",
      name: "max-height",
      type: "number",
      unitOptions: sizeTypes,
    } as TextFieldOptionsField,
  ]),
};
