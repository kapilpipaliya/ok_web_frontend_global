import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

export const Login: IFormMetaData = {
  attributes: [
    { componentName: "TextBox", name: "email" },
    {
      componentName: "TextBox",
      mode: "password",
      name: "pass",
    },
  ],
  isRealTime: true,
  name: "User",
  title: "User",
};
