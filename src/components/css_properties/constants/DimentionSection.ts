import { sizeTypes } from "./csseditor_constants";
import {
  createGridOptions,
  type TextFieldOptionsField,
} from "./FieldSchemaType";

export const DimentionSection = {
  width: createGridOptions("grid", "Dimention", [
    {
      componentName: "string",
      isLabelOnTop: true,
      key: "width",
      label: "Width",
      type: "number",
      unitOptions: sizeTypes,
    } as TextFieldOptionsField,
    {
      componentName: "string",
      isLabelOnTop: true,
      key: "min-width",
      label: "Min width",
      type: "number",
      unitOptions: sizeTypes,
    } as TextFieldOptionsField,
    {
      componentName: "string",
      isLabelOnTop: true,
      key: "max-width",
      label: "Max width",
      type: "number",
      unitOptions: sizeTypes,
    } as TextFieldOptionsField,
  ]),
  // eslint-disable-next-line perfectionist/sort-objects
  height: createGridOptions("grid", "Dimention", [
    {
      componentName: "string",
      isLabelOnTop: true,
      key: "height",
      label: "Height",
      type: "number",
      unitOptions: sizeTypes,
    } as TextFieldOptionsField,
    {
      componentName: "string",
      isLabelOnTop: true,
      key: "min-height",
      label: "Min height",
      type: "number",
      unitOptions: sizeTypes,
    } as TextFieldOptionsField,
    {
      componentName: "string",
      isLabelOnTop: true,
      key: "max-height",
      label: "Max height",
      type: "number",
      unitOptions: sizeTypes,
    } as TextFieldOptionsField,
  ]),
};
