/* eslint-disable perfectionist/sort-objects */

import { CSSWideKeywords, extraPropertyValues } from "./CSSMetadata";
import { createSelectOptions } from "../FieldSchemaType";

export const ListSection = {
  listStyleType: createSelectOptions("list-style-type", "List Style Type", [
    ...extraPropertyValues["list-style"].values,
    ...CSSWideKeywords,
  ]),
  listStylePosition: createSelectOptions(
    "list-style-position",
    "List Style Position",
    ["inside", "outside", ...CSSWideKeywords],
  ),
  // TODO ADD SUPPORT FOR list-style-image
  //  listStyleImage: createSelectOptions("list-style-image", "List Style Image", [...extraPropertyValues["list-style-image"].values, ...CSSWideKeywords]),
};
