import type { IFormMetaData } from "~/lib/FormMetadataType";

export const CompCategory: IFormMetaData = {
  attributes: [
    { component: "TextBox", name: "name" },
    { component: "TextBox", name: "label" },
    { component: "TextArea", name: "description" },
  ],
  isInlineEditable: true,
  name: "CompCategory",
  title: "Component Category",
};
