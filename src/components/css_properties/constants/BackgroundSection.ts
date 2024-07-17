/* eslint-disable perfectionist/sort-objects */
import type {
  ColorPickerField,
} from "./FieldType";

import { CSSWideKeywords } from "./CSSMetadata";
import { createSelectOptions } from "./FieldType";

export const BackgroundSection = {
  backgroundColor: {
    componentName: "colorPicker",
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
