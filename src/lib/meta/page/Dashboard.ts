import { PROPERTIES } from "~/components/styled/constants/constant";

export const Dashboard = {
  attributes: [
    {
      componentName: "SystemString",
      key: "key",
    },
    {
      class: PROPERTIES.Css.TextField,
      componentName: "SystemTextArea",
      key: "description",
    },
  ],
  isInlineEditable: true,
  key: "Dashboard",
  title: "Dashboards",
};
