import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { PROPERTIES } from "~/components/styled/constants/constant";

export const CollCategory: IFormMetaData = {
  attributes: [
    {
      componentName: "SystemString",
      key: "key",
    },
    {
      componentName: "SystemString",
      key: "label",
    },
    {
      class: PROPERTIES.Css.TextField,
      componentName: "SystemTextArea",
      key: "description",
    },
  ],
  isInlineEditable: true,
  key: "CollCategory",
  title: "Collection Category",
};
