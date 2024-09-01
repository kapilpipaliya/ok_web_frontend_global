import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

export const Login: IFormMetaData = {
  attributes: [
    {
      componentName: "SystemString",
      key: "email",
    },
    {
      componentName: "SystemString",
      key: "pass",
      mode: "password",
    },
  ],
  isRealTime: true,
  key: "User",
  title: "User",
};
