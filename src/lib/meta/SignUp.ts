import type { IFormMetaData } from "~/lib/FormMetadataType";

export const SignUp: IFormMetaData = {
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
