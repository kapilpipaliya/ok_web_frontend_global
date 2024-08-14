import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

export const SignUp: IFormMetaData = {
  attributes: [
    { componentName: "TextField", name: "email" },
    {
      componentName: "TextField",
      mode: "password",
      name: "pass",
    },
  ],
  isRealTime: true,
  name: "User",
  title: "User",
};
