import type { IFormMetaData } from "~/lib/FormMetadataType";

export const DataType: IFormMetaData = {
  attributes: [
    { component: "TextBox", name: "name" },
    { component: "TextBox", name: "label" },
    {
      collection: "g:'Comp'",
      component: "SelectBox",
      displayName: "Default Component",

      name: "default",
    },
  ],
  isInlineEditable: true,
  name: "DataType",
  title: "DataType",
};
