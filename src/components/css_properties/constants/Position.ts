 
import { CSSWideKeywords } from "./CSSMetadata";
import { type TextFieldOptionsField, createGridOptions, createSelectOptions } from "./FieldType";
import { sizeTypes } from "./constants";

export const PositionSection = {
  dimentions: createGridOptions("grid", "Dimention", [
 {
    componentName: "textFieldOptions",
    isLabelOnTop: true,
    label: "Top",
    name: "top",
    options: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,
  {
    componentName: "textFieldOptions",
    isLabelOnTop: true,
    label: "Right",
    name: "right",
    options: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,
  {
    componentName: "textFieldOptions",
    isLabelOnTop: true,
    label: "Bottom",
    name: "bottom",
    options: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,
  {
    componentName: "textFieldOptions",
    isLabelOnTop: true,
    label: "Left",
    name: "left",
    options: sizeTypes,
    type: "number",
  } as TextFieldOptionsField,
]),
  position: createSelectOptions("position", "Position", ["static", "relative", "absolute", "fixed", "sticky", ...CSSWideKeywords]),
  zIndex: {
    componentName: "textFieldOptions",
    label: "Z-Index",
    name: "z-index",
    type: "number",
  } as TextFieldOptionsField,
};
