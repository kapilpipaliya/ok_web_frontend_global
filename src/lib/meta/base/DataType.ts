import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { textFieldInputMeta } from "~/components/constants/textFieldInput";

export const DataType: IFormMetaData = {
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
      collection: "g:'Comp'",
      componentName: "SelectBox",
      displayName: "Default Component",

      name: "default",
    },
  ],
  isInlineEditable: true,
  name: "DataType",
  title: "DataType",
};
