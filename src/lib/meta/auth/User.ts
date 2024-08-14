export const User = {
  attributes: [
    { componentName: "TextField", name: "name" },
    { componentName: "TextField", name: "email" },
    { componentName: "TextField", name: "pass" },
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
