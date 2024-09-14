import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { PROPERTIES } from "~/components/constants/constant";

export const GlobalSetting: IFormMetaData = {
  attributes: [
    {
      collection: "g:'Theme'",
      componentName: "SelectBox",
      key: "Theme",
    },
    {
      class: PROPERTIES.Css.TextField,
      componentName: "SystemTextArea",
      key: "description",
    },
  ],
  key: "GlobalSetting",
  title: "Global Setting",
};
