import type { IFormMetaData } from "~/lib/FormMetadataType";

export const SignUp: IFormMetaData = {
  attributes: [
    { component: "TextBox", name: "email" },
    {
      component: "TextBox",
      mode: "password",
      name: "pass",
    },
  ],
  isRealTime: true,
  name: "User",
  title: "User",
};
