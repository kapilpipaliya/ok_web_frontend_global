/* eslint-disable perfectionist/sort-objects */
import type {
  ColorPickerField,
  FieldWithCustomProperty,
  TextFieldOptionsField,
} from "./FieldSchemaType";

import { CSSWideKeywords, extraPropertyValues } from "./CSSMetadata";
import { createSelectOptions } from "./FieldSchemaType";

export const BackgroundSection = {
  background: {
    componentName: "textFieldOptions",
    label: "Background",
    name: "background",
    options: [...CSSWideKeywords],
  } as TextFieldOptionsField,
  backgroundColor: {
    componentName: "colorPicker",
    label: "Color",
    name: "background-color",
  } as ColorPickerField,
  backgroundImage: {
    componentName: "textFieldOptions",
    label: "Image",
    name: "background-image",
    options: [...extraPropertyValues["background-image"].values],
    showFilePicker: true,
  } as TextFieldOptionsField,
  // todo add gradient support
  backgroundRepeat: {
    componentName: "textFieldOptions",
    label: "Repeat",
    name: "background-repeat",
    options: [
      "repeat",
      "repeat-x",
      "repeat-y",
      "no-repeat",
      ...CSSWideKeywords,
    ],
  } as TextFieldOptionsField,
  backgroundPosition: {
    componentName: "fieldWithCustomProperty",
    label: "Position",
    name: "background-position",
    options: ["top", "bottom", "left", "right", "center", ...CSSWideKeywords],
    customProperty: [
      { label: "Position X", name: "background-position-x" },
      { label: "Position Y", name: "background-position-y" },
    ],
    gridType: "repeat(1,auto)",
    mainFieldType: "textFieldOptions",
  } as FieldWithCustomProperty,
  backgroundSize: {
    componentName: "textFieldOptions",
    label: "Size",
    name: "background-size",
    options: ["auto", "cover", "contain", ...CSSWideKeywords],
  } as TextFieldOptionsField,
  backgroundAttachment: {
    componentName: "textFieldOptions",
    label: "Attachment",
    name: "background-attachment",
    options: ["scroll", "fixed", "local", ...CSSWideKeywords],
  } as TextFieldOptionsField,
  backgroundOrigin: createSelectOptions("background-origin", "Origin", [
    "border-box",
    "padding-box",
    "content-box",
    ...CSSWideKeywords,
  ]),
  backgroundClip: createSelectOptions("clip-path", "Clip", [
    "border-box",
    "padding-box",
    "content-box",
    "text",
    ...CSSWideKeywords,
  ]),
  backgroundBlendMode: {
    componentName: "textFieldOptions",
    label: "Blend Mode",
    name: "background-blend-mode",
    options: [
      "normal",
      "multiply",
      "screen",
      "overlay",
      "darken",
      "lighten",
      "color-dodge",
      "color-burn",
      "hard-light",
      "soft-light",
      "difference",
      "exclusion",
      "hue",
      "saturation",
      "color",
      "luminosity",
    ],
  } as TextFieldOptionsField,
};
