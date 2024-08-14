import { textFieldInputMeta } from "~/components/constants/textFieldInput";

export const User = {
  attributes: [
    { componentName: "TextField", name: "name", attributes: [textFieldInputMeta] },
    { componentName: "TextField", name: "email", attributes: [textFieldInputMeta] },
    { componentName: "TextField", name: "pass", attributes: [textFieldInputMeta] },
    {
      collection: "g:'Role'",
      componentName: "TagBox",
      name: "role",
    },
  ],
  isInlineEditable: true,
  name: "User",
  title: "User",
};
