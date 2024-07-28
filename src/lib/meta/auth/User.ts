export const User = {
  attributes: [
    { componentName: "TextBox", name: "name" },
    { componentName: "TextBox", name: "email" },
    { componentName: "TextBox", name: "pass" },
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
