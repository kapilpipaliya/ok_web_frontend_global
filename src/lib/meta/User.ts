export const User = {
  attributes: [
    { component: "TextBox", name: "name" },
    { component: "TextBox", name: "email" },
    { component: "TextBox", name: "pass" },
    {
      collection: "g:'Role'",
      component: "TagBox",

      name: "role",
    },
  ],
  isInlineEditable: true,
  name: "User",
  title: "User",
};
