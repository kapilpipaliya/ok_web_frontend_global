import type { IFormMetaData } from "~/lib/FormMetadataType";

export const CollCategory: IFormMetaData = {
  attributes: [
    { component: "TextBox", name: "name" },
    { component: "TextBox", name: "label" },
    { component: "TextArea", name: "description" },
  ],
  isInlineEditable: true,
  name: "CollCategory",
  title: "Collection Category",
};
