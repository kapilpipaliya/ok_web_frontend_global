 
import { createSignal } from "solid-js";

import type {
  DataEditorField,
  TextFieldOptionsField,
} from "./FieldType";

import { createGridOptions } from "./FieldType";
import { createSelectOptions } from "./FieldType";
import { timesTypes } from "./constants";

export const Transition = {
  transition: {
    children: {
      easing: createSelectOptions(
        "easing",
        "Easing",
        ["ease", "ease-in", "ease-in-out", "ease-out", "linear"],
        true,
      ),
      shadow: createGridOptions("size Grid", "Transition", [
        {
          component: "textFieldOptions",
          isLabelOnTop: true,
          label: "Duration",
          name: "duration",
          options: timesTypes,
          type: "number",
        } as TextFieldOptionsField,
        {
          component: "textFieldOptions",
          isLabelOnTop: true,
          label: "Delay",
          name: "delay",
          options: timesTypes,
          type: "number",
        } as TextFieldOptionsField,
      ]),
      type: createSelectOptions(
        "type",
        "Type",
        [
          "height",
          "width",
          "min height",
          "min width",
          "max height",
          "max width",
          "padding",
          "margin",
          "color",
          "font",
          "font size",
          "line height",
          "letter height",
          "border",
          "border radius",
          "background",
          "opacity",
          "box shadow",
          "text shadow",
          "filter",
          "backdrop filter",
          "transform",
          "all",
        ],
        true,
      ),
    },
    component: "dataEditor",
    dialogLabel: "Adjust Transition",
    fallback: "No transition",
    label: "Transition",
    name: "transition",
    openMenu: createSignal(null),
  } as DataEditorField,
};
