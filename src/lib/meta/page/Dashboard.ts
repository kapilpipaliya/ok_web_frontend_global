import { textFieldInputMeta, textFieldTextAreaMeta } from "~/components/constants/textFieldInput";

export const Dashboard = {
  attributes: [
    { attributes: [textFieldInputMeta], componentName: "TextField", name: "name" },
    { attributes: [textFieldTextAreaMeta], componentName: "TextField", name: "description" },
  ],
  isInlineEditable: true,
  name: "Dashboard",
  title: "Dashboards",
};
