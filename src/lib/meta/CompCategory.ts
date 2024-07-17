import type { IFormMetaData } from "~/lib/FormMetadataType";

export const CompCategory: IFormMetaData = {
  attributes: [
    { componentName: "TextBox", name: "name" },
    { componentName: "TextBox", name: "label" },
    { componentName: "TextArea", name: "description" },
  ],
  isInlineEditable: true,
  name: "CompCategory",
  title: "Component Category",
};
