import { sizeTypes } from "../csseditor_constants";
import {
  createGridOptions,
  createSelectOptions,
  type TextFieldOptionsField,
} from "../FieldSchemaType";
import { CSSWideKeywords } from "./CSSMetadata";

export const PositionSection = {
  dimentions: createGridOptions("grid", "Position", [
    {
      componentName: "string",
      key: "top",
      label: "Top",
      // type: "number",
      // unitOptions: sizeTypes,
    } as TextFieldOptionsField,
    {
      componentName: "string",
      key: "right",
      label: "Right",
      // type: "number",
      // unitOptions: sizeTypes,
    } as TextFieldOptionsField,
    {
      componentName: "string",
      key: "bottom",
      label: "Bottom",
      // type: "number",
      // unitOptions: sizeTypes,
    } as TextFieldOptionsField,
    {
      componentName: "string",
      key: "left",
      label: "Left",
      // type: "number",
      // unitOptions: sizeTypes,
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
    componentName: "string",
    key: "z-index",
    label: "Z-Index",
    type: "number",
  } as TextFieldOptionsField,
};
