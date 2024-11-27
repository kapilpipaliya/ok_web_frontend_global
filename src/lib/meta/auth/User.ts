export const User = {
  attributes: [
    {
      componentName: "TextInput",
      key: "key",
    },
    {
      componentName: "TextInput",
      key: "email",
    },
    {
      componentName: "TextInput",
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
