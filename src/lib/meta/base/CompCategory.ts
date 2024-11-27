import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { PROPERTIES } from "~/components/styled/constants/constant";

export const CompCategory: IFormMetaData = {
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
  key: "CompCategory",
  title: "Component Category",
};
