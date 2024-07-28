import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

export const FormCategory: IFormMetaData = {
  attributes: [
    { componentName: "TextBox", name: "name" },
    { componentName: "TextBox", name: "label" },
    { componentName: "TextArea", name: "description" },
  ],
  isInlineEditable: true,
  name: "FormCategory",
  title: "Form Category",
};
