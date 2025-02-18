import type {
  DataEditorField,
  TextFieldOptionsField,
} from "../FieldSchemaType";

import { timesTypes } from "../csseditor_constants";
import { createGridOptions } from "../FieldSchemaType";
import { createSelectOptions } from "../FieldSchemaType";

export const Transition = {
  transition: {
    children: [
      createSelectOptions(
        "easing",
        "Easing",
        ["ease", "ease-in", "ease-in-out", "ease-out", "linear"],
        true,
      ),
      createGridOptions("size Grid", "Transition", [
        {
          componentName: "string",
          isLabelOnTop: true,
          key: "duration",
          label: "Duration",
          type: "number",
          unitOptions: timesTypes,
        } as TextFieldOptionsField,
        {
          componentName: "string",
          isLabelOnTop: true,
          key: "delay",
          label: "Delay",
          type: "number",
          unitOptions: timesTypes,
        } as TextFieldOptionsField,
      ]),
      createSelectOptions(
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
    ],
    componentName: "dataEditor",
    dialogLabel: "Adjust Transition",
    fallback: "No transition",
    hideLabel: true,
    key: "transition",
    label: "Transition",
    useParentProjection: true,
  } as DataEditorField,
};
