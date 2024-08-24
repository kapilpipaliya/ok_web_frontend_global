import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { textFieldInputMeta } from "~/components/constants/textFieldInput";

export const SignUp: IFormMetaData = {
  attributes: [
    {
      attributes: [textFieldInputMeta],
      componentName: "TextField",
      name: "email",
    },
    {
      attributes: [textFieldInputMeta],
      componentName: "TextField",
      mode: "password",
      name: "pass",
    },
  ],
  isRealTime: true,
  name: "User",
  title: "User",
};
