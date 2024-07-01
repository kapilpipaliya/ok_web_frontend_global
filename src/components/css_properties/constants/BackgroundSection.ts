import { createSignal } from "solid-js";

import { sizeTypes } from "../context";
import { createGridOptions } from "./createGridOptions";
import { createSelectOptions } from "./createSelectOptions";

export const BackgroundSection = {
  background: {
    children: {
      data: {
        component: "colorPicker",
        isLabelOnTop: true,
        label: "Shadow Color",
        name: "color",
      },
      shadow: createGridOptions("grid", "Shadow", [
        {
          component: "textFieldOptions",
          isAddToClass: false,
          isLabelOnTop: true,
          label: "X Offset",
          name: "x-offset",
          options: sizeTypes,
          type: "number",
        },
        {
          component: "textFieldOptions",
          isAddToClass: false,
          isLabelOnTop: true,
          label: "Y Offset",
          name: "y-offset",
          options: sizeTypes,
          type: "number",
        },
        {
          component: "textFieldOptions",
          isAddToClass: false,
          isLabelOnTop: true,
          label: "Blur",
          name: "blur",
          options: sizeTypes,
          type: "number",
        },
        {
          component: "textFieldOptions",
          isAddToClass: false,
          isLabelOnTop: true,
          label: "Spread",
          name: "spread",
          options: sizeTypes,
          type: "number",
        },
      ]),
      style: {
        component: "toggleButton",
        label: false,
        name: "type",
        options: [
          { key: "Outside", value: "" },
          { key: "Inside", value: "inset" },
        ],
      },
    },
    component: "dataEditor",
    dialogLabel: "Adjust Shadow",
    fallback: "No Shadow Effects",
    label: "Box Shadow",
    name: "box-shadow",
    openMenu: createSignal(null),
  },
  backgroundColor: {
    component: "colorPicker",
    isLabelOnTop: true,
    label: "Background Color",
    name: "background-color",
  },
  clip: createSelectOptions("clip-path", "Clip", [
    "border-box",
    "padding-box",
    "content-box",
    "fill-box",
    "stroke-box",
    "margin-box",
  ]),
};
