import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { PROPERTIES } from "~/pages/settings/constants";

export const GlobalSetting: IFormMetaData = {
  attributes: [
    {
      collection: "g:'Theme'",
      componentName: "Select",
      key: "Theme",
    },
    {
      class: PROPERTIES.Css.TextField,
      componentName: "TextArea",
      key: "description",
    },
  ],
  key: "GlobalSetting",
  title: "Global Setting",
};
