export const User = {
  attributes: [
    {
      componentName: "SystemString",
      key: "key",
    },
    {
      componentName: "SystemString",
      key: "email",
    },
    {
      componentName: "SystemString",
      key: "pass",
    },
    {
      collection: "g:'Role'",
      componentName: "MultiSelect",
      key: "role",
    },
  ],
  isInlineEditable: true,
  key: "User",
  title: "User",
};
