import type { IFormMetaData } from "~/lib/FormMetadataType";

export const FormCategory: IFormMetaData = {
  attributes: [
    { component: "TextBox", name: "name" },
    { component: "TextBox", name: "label" },
    { component: "TextArea", name: "description" },
  ],
  isInlineEditable: true,
  name: "FormCategory",
  title: "Form Category",
};
