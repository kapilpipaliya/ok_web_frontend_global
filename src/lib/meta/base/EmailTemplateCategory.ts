import type { IFormMetaData } from "~/lib/meta/FormMetadataType";
import { PROPERTIES } from "~/pages/settings/constants";

export const EmailTemplateCategory: IFormMetaData = {
  attributes: [
    {
      componentName: "SystemTextInput",
      key: "key",
    },
    {
      componentName: "SystemTextInput",
      key: "name",
    },
    {
      componentName: "SystemTextInput",
      key: "displayOrder",
      type: "number",
    },
    {
      css: PROPERTIES.Css.TextFieldCss,
      componentName: "SystemTextInput",
      type: "textarea",
      key: "description",
    },
  ],
  isInlineEditable: false,
  key: "EmailTemplateCategory",
  title: "Email Template Category",
};
