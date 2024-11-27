import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

export const DataType: IFormMetaData = {
  attributes: [
    {
      componentName: "TextInput",
      key: "key",
    },
    {
      componentName: "TextInput",
      key: "label",
    },
    {
      collection: "g:'Comp'",
      componentName: "Select",
      displayName: "Default Component",

      key: "default",
    },
  ],
  isInlineEditable: true,
  key: "DataType",
  title: "DataType",
};
