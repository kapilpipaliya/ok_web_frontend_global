import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
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
      css: PROPERTIES.Css.TextFieldCss,
      componentName: "TextArea",
      key: "description",
    },
  ],
  key: "GlobalSetting",
  title: "Global Setting",
};
