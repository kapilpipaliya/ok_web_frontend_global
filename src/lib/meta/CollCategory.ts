import type { IFormMetaData } from "~/lib/FormMetadataType";

export const CollCategory: IFormMetaData = {
  attributes: [
    { componentName: "TextBox", name: "name" },
    { componentName: "TextBox", name: "label" },
    { componentName: "TextArea", name: "description" },
  ],
  isInlineEditable: true,
  name: "CollCategory",
  title: "Collection Category",
};
