import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

export const DataType: IFormMetaData = {
  attributes: [
    { componentName: "TextBox", name: "name" },
    { componentName: "TextBox", name: "label" },
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
