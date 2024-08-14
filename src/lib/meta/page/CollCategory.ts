import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

export const CollCategory: IFormMetaData = {
  attributes: [
    { componentName: "TextField", name: "name" },
    { componentName: "TextField", name: "label" },
    { componentName: "TextArea", name: "description" },
  ],
  isInlineEditable: true,
  name: "CollCategory",
  title: "Collection Category",
};
