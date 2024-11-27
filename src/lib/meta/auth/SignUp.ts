import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

export const SignUp: IFormMetaData = {
  attributes: [
    {
      componentName: "TextInput",
      key: "email",
    },
    {
      componentName: "TextInput",
      key: "pass",
      mode: "password",
    },
  ],
  isRealTime: true,
  key: "User",
  title: "User",
};
