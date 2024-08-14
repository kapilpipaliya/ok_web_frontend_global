import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

export const CompCategory: IFormMetaData = {
  attributes: [
    { componentName: "TextField", name: "name" },
    { componentName: "TextField", name: "label" },
    { componentName: "TextArea", name: "description" },
  ],
  isInlineEditable: true,
  name: "CompCategory",
  title: "Component Category",
};
