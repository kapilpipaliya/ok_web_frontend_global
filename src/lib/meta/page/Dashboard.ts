import { textFieldInputMeta, textFieldTextAreaMeta } from "~/components/constants/textFieldInput";

export const Dashboard = {
  attributes: [
    { componentName: "TextField", name: "name", attributes: [textFieldInputMeta] },
    { componentName: "TextField", name: "description", attributes: [textFieldTextAreaMeta] },
  ],
  isInlineEditable: true,
  name: "Dashboard",
  title: "Dashboards",
};
