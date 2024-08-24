import type { DataEditorField, TextFieldOptionsField } from "./FieldSchemaType";

import { timesTypes } from "./csseditor_constants";
import { createGridOptions } from "./FieldSchemaType";
import { createSelectOptions } from "./FieldSchemaType";

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
          componentName: "textFieldOptions",
          isLabelOnTop: true,
          label: "Duration",
          name: "duration",
          type: "number",
          unitOptions: timesTypes,
        } as TextFieldOptionsField,
        {
          componentName: "textFieldOptions",
          isLabelOnTop: true,
          label: "Delay",
          name: "delay",
          type: "number",
          unitOptions: timesTypes,
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
    componentName: "dataEditor",
    dialogLabel: "Adjust Transition",
    fallback: "No transition",
    label: "Transition",
    name: "transition",
  } as DataEditorField,
};
