import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { PROPERTIES } from "~/pages/settings/constants";

export const FormCategory: IFormMetaData = {
  attributes: [
    {
      componentName: "TextInput",
      key: "key",
    },
    {
      componentName: "TextInput",
      key: "label",
    },
    {
      css: PROPERTIES.Css.TextFieldCss,
      componentName: "TextArea",
      key: "description",
    },
  ],
  isInlineEditable: true,
  key: "FormCategory",
  title: "Form Category",
};
