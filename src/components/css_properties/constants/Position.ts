import { sizeTypes } from "./csseditor_constants";
import { CSSWideKeywords } from "./CSSMetadata";
import {
  createGridOptions,
  createSelectOptions,
  type TextFieldOptionsField,
} from "./FieldSchemaType";

export const PositionSection = {
  dimentions: createGridOptions("grid", "Dimention", [
    {
      componentName: "textFieldOptions",
      isLabelOnTop: true,
      label: "Top",
      name: "top",
      type: "number",
      unitOptions: sizeTypes,
    } as TextFieldOptionsField,
    {
      componentName: "textFieldOptions",
      isLabelOnTop: true,
      label: "Right",
      name: "right",
      type: "number",
      unitOptions: sizeTypes,
    } as TextFieldOptionsField,
    {
      componentName: "textFieldOptions",
      isLabelOnTop: true,
      label: "Bottom",
      name: "bottom",
      type: "number",
      unitOptions: sizeTypes,
    } as TextFieldOptionsField,
    {
      componentName: "textFieldOptions",
      isLabelOnTop: true,
      label: "Left",
      name: "left",
      type: "number",
      unitOptions: sizeTypes,
    } as TextFieldOptionsField,
  ]),
  position: createSelectOptions("position", "Position", [
    "static",
    "relative",
    "absolute",
    "fixed",
    "sticky",
    ...CSSWideKeywords,
  ]),
  zIndex: {
    componentName: "textFieldOptions",
    label: "Z-Index",
    name: "z-index",
    type: "number",
  } as TextFieldOptionsField,
};
