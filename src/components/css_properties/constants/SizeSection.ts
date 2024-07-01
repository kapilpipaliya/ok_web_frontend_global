import { sizeTypes } from "../context";
import { createGridOptions } from "./createGridOptions";

export const SizeSection = {
  size: createGridOptions("size Grid", "Size", [
    {
      component: "textFieldOptions",
      isLabelOnTop: true,
      label: "Height",
      name: "height",
      options: sizeTypes,
      type: "number",
    },
    {
      component: "textFieldOptions",
      isLabelOnTop: true,
      label: "Width",
      name: "width",
      options: sizeTypes,
      type: "number",
    },
    {
      component: "textFieldOptions",
      isLabelOnTop: true,
      label: "Min height",
      name: "min-height",
      options: sizeTypes,
      type: "number",
    },
    {
      component: "textFieldOptions",
      isLabelOnTop: true,
      label: "Min width",
      name: "min-width",
      options: sizeTypes,
      type: "number",
    },
    {
      component: "textFieldOptions",
      isLabelOnTop: true,
      label: "Max height",
      name: "max-height",
      options: sizeTypes,
      type: "number",
    },
    {
      component: "textFieldOptions",
      isLabelOnTop: true,
      label: "Max width",
      name: "max-width",
      options: sizeTypes,
      type: "number",
    },
  ])
};
