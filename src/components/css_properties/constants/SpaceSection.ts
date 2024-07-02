import type { TextFieldOptionsField } from "./FieldType";

import { sizeTypes } from "../context";
import { createGridOptions } from "./FieldType";


type SpaceSectionType = {
  margin: ReturnType<typeof createGridOptions>;
  padding: ReturnType<typeof createGridOptions>;
};

export const SpaceSection: SpaceSectionType = {
  margin: createGridOptions("margin", "Margin", [
    {
      component: "textFieldOptions",
      isAddToClass: true,
      isLabelOnTop: true,
      label: "Margin Top",
      name: "margin-top",
      options: sizeTypes,
      type: "number",
    } as TextFieldOptionsField,
    {
      component: "textFieldOptions",
      isAddToClass: true,
      isLabelOnTop: true,
      label: "Margin Left",
      name: "margin-left",
      options: sizeTypes,
      type: "number",
    } as TextFieldOptionsField  ,
    {
      component: "textFieldOptions",
      isAddToClass: true,
      isLabelOnTop: true,
      label: "Margin Right",
      name: "margin-right",
      options: sizeTypes,
      type: "number",
    } as TextFieldOptionsField,
    {
      component: "textFieldOptions",
      isAddToClass: true,
      isLabelOnTop: true,
      label: "Margin Bottom",
      name: "margin-bottom",
      options: sizeTypes,
      type: "number",
    } as TextFieldOptionsField,
  ]),
  padding: createGridOptions("padding", "Padding", [
    {
      component: "textFieldOptions",
      isAddToClass: true,
      isLabelOnTop: true,
      label: "Padding Top",
      name: "padding-top",
      options: sizeTypes,
      type: "number",
    } as TextFieldOptionsField,
    {
      component: "textFieldOptions",
      isAddToClass: true,
      isLabelOnTop: true,
      label: "Padding Left",
      name: "padding-left",
      options: sizeTypes,
      type: "number",
    } as TextFieldOptionsField,
    {
      component: "textFieldOptions",
      isAddToClass: true,
      isLabelOnTop: true,
      label: "Padding Right",
      name: "padding-right",
      options: sizeTypes,
      type: "number",
    } as TextFieldOptionsField,
    {
      component: "textFieldOptions",
      isAddToClass: true,
      isLabelOnTop: true,
      label: "Padding Bottom",
      name: "padding-bottom",
      options: sizeTypes,
      type: "number",
    } as TextFieldOptionsField,
  ]),
};
