export const Import = {
  attributes: [
    {
      component: "TextArea",
      height: 500,
      name: "csv",
      width: 600,
    },
    { component: "TextBox", name: "label" },
    { component: "CheckBox", name: "dry" },
    { component: "TextBox", name: "lookup" },
    { component: "TextBox", name: "lookupId" },
    { component: "TextBox", name: "lookupChild" },
    {
      attributes: [
        { component: "TextBox", name: "column" },
        // {
        //  name: "column",
        //  component: "SelectBox",
        //
        //   displayExpr: "key",
        //   collection: "Update Dynamically on meta based on first row",
        //  },
        // },
        { component: "TextBox", displayName: "Attribute ID", name: "attrId" },
        {
          collection: "g:'Form'",
          component: "SelectBox",
          displayExpr: "name",

          displayName: "Lookup Collection",
          name: "coll",
        },
        {
          component: "TextBox",
          displayName: "Lookup Label",
          name: "collLabel",
        },
        { component: "CheckBox", name: "inward" },
        {
          component: "TextBox",
          displayName: "Lookup Collection ID",
          name: "collId",
        },
        { component: "TextBox", displayName: "Edge Type", name: "edge" },
        {
          collection: '[{"key":"dataType","id":"dataType"}, {"id": "lookup", "key": "lookup"}]',
          component: "SelectBox",
          displayExpr: "key",

          displayName: "Function",
          name: "func",
          stringValue: true,
        },
        { component: "CheckBox", name: "skip" },
        { component: "TextArea", name: "skipRow" },
      ],
      component: "DynamicTable",
      name: "meta",
    },
  ],
  isRealTime: true,
  name: "Import",
  title: "Simple Insert",
};
