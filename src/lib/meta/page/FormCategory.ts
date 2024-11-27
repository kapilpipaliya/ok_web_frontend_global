import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { PROPERTIES } from "~/components/styled/constants/constant";

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
      class: PROPERTIES.Css.TextField,
      componentName: "TextArea",
      key: "description",
    },
  ],
  isInlineEditable: true,
  key: "FormCategory",
  title: "Form Category",
};
