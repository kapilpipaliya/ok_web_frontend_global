import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import {
  textFieldInputMeta,
  textFieldTextAreaMeta,
} from "~/components/constants/textFieldInput";

export const CollCategory: IFormMetaData = {
  attributes: [
    {
      attributes: [textFieldInputMeta],
      componentName: "TextField",
      name: "name",
    },
    {
      attributes: [textFieldInputMeta],
      componentName: "TextField",
      name: "label",
    },
    {
      attributes: [textFieldTextAreaMeta],
      componentName: "TextField",
      name: "description",
    },
  ],
  isInlineEditable: true,
  name: "CollCategory",
  title: "Collection Category",
};
