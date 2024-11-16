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
    componentName: "string",
    label: "Background",
    key: "background",
    options: [...CSSWideKeywords],
  } as TextFieldOptionsField,
  backgroundColor: {
    componentName: "colorPicker",
    label: "Color",
    key: "background-color",
  } as ColorPickerField,
  backgroundImage: {
    componentName: "string",
    label: "Image",
    key: "background-image",
    options: [...extraPropertyValues["background-image"].values],
    showFilePicker: true,
  } as TextFieldOptionsField,
  // todo add gradient support
  backgroundRepeat: {
    componentName: "string",
    label: "Repeat",
    key: "background-repeat",
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
    isLabelOnTop: true,
    key: "background-position",
    options: ["top", "bottom", "left", "right", "center", ...CSSWideKeywords],
    customProperty: [
      { label: "Position X", key: "background-position-x" },
      { label: "Position Y", key: "background-position-y" },
    ],
    gridType: "repeat(1,auto)",
    mainFieldType: "string",
  } as FieldWithCustomProperty,
  backgroundSize: {
    componentName: "string",
    label: "Size",
    key: "background-size",
    options: ["auto", "cover", "contain", ...CSSWideKeywords],
  } as TextFieldOptionsField,
  backgroundAttachment: {
    componentName: "string",
    label: "Attachment",
    key: "background-attachment",
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
    componentName: "string",
    label: "Blend Mode",
    key: "background-blend-mode",
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
