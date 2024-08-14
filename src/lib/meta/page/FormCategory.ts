import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

export const FormCategory: IFormMetaData = {
  attributes: [
    { componentName: "TextField", name: "name" },
    { componentName: "TextField", name: "label" },
    { componentName: "TextArea", name: "description" },
  ],
  isInlineEditable: true,
  name: "FormCategory",
  title: "Form Category",
};
