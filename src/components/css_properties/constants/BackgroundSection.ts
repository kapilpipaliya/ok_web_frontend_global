/* eslint-disable perfectionist/sort-objects */
import type {
  ColorPickerField,
  DataEditorField,
  TextFieldOptionsField,
  ToggleField,
} from "./FieldType";

import { createGridOptions } from "./FieldType";
import { createSelectOptions } from "./FieldType";
import { sizeTypes } from "./constants";
import { CSSWideKeywords } from "./CSSMetadata";

export const BackgroundSection = {
  backgroundColor: {
    component: "colorPicker",
    isLabelOnTop: true,
    label: "Background Color",
    name: "background-color",
  } as ColorPickerField,
  backgroundClip: createSelectOptions("clip-path", "Background clip", [
    "border-box",
    "padding-box",
    "content-box",
    "text",
    ...CSSWideKeywords
  ]),
  backgroundBlendMode: createSelectOptions("background-blend-mode", "Blend Mode", [
    "normal",
    "multiply",
    "screen",
    "overlay",
    "darken",
    "lighten",
    "color dodge",
    "color burn",
    "hard light",
    "soft light",
    "difference",
    "exclusion",
    "hue",
    "saturation",
    "color",
    "luminosity",
  ],true),
};
