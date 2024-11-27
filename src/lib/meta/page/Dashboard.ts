import { PROPERTIES } from "~/components/styled/constants/constant";

export const Dashboard = {
  attributes: [
    {
      componentName: "TextInput",
      key: "key",
    },
    {
      class: PROPERTIES.Css.TextField,
      componentName: "TextArea",
      key: "description",
    },
  ],
  isInlineEditable: true,
  key: "Dashboard",
  title: "Dashboards",
};
