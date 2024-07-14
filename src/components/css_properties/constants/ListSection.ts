/* eslint-disable perfectionist/sort-objects */
import type {
  DividerField,
  FieldWithCustomProperty,
  TextFieldOptionsField,
} from "./FieldType";

import { CSSWideKeywords, extraPropertyValues } from "./CSSMetadata";
import { createButtonGroupOptions, createSelectOptions } from "./FieldType";
import { Icons } from "./Icons";
import { sizeTypes } from "./constants";

export const ListSection = {
  listStyleType: createSelectOptions("list-style-type", "List Style Type", [...extraPropertyValues["list-style"].values, ...CSSWideKeywords]),
  listStylePosition: createSelectOptions("list-style-position", "List Style Position", ['inside', 'outside', ...CSSWideKeywords]),
  // TODO ADD SUPPORT FOR list-style-image
  //  listStyleImage: createSelectOptions("list-style-image", "List Style Image", [...extraPropertyValues["list-style-image"].values, ...CSSWideKeywords]),

};