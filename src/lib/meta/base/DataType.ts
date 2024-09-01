import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

export const DataType: IFormMetaData = {
  attributes: [
    {
      componentName: "SystemString",
      key: "key",
    },
    {
      componentName: "SystemString",
      key: "label",
    },
    {
      collection: "g:'Comp'",
      componentName: "SelectBox",
      displayName: "Default Component",

      key: "default",
    },
  ],
  isInlineEditable: true,
  key: "DataType",
  title: "DataType",
};
