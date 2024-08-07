export const Import = {
  attributes: [
    {
      componentName: "TextArea",
      height: 500,
      name: "csv",
      width: 600,
    },
    { componentName: "TextBox", name: "label" },
    { componentName: "CheckBox", name: "dry" },
    { componentName: "TextBox", name: "lookup" },
    { componentName: "TextBox", name: "lookupId" },
    { componentName: "TextBox", name: "lookupChild" },
    {
      attributes: [
        { componentName: "TextBox", name: "column" },
        // {
        //  name: "column",
        //  componentName: "SelectBox",
        //
        //   displayExpr: "key",
        //   collection: "Update Dynamically on meta based on first row",
        //  },
        // },
        {
          componentName: "TextBox",
          displayName: "Attribute ID",
          name: "attrId",
        },
        {
          collection: "g:'Form'",
          componentName: "SelectBox",
          displayExpr: "name",

          displayName: "Lookup Collection",
          name: "coll",
        },
        {
          componentName: "TextBox",
          displayName: "Lookup Label",
          name: "collLabel",
        },
        { componentName: "CheckBox", name: "inward" },
        {
          componentName: "TextBox",
          displayName: "Lookup Collection ID",
          name: "collId",
        },
        { componentName: "TextBox", displayName: "Edge Type", name: "edge" },
        {
          collection:
            '[{"key":"dataType","id":"dataType"}, {"id": "lookup", "key": "lookup"}]',
          componentName: "SelectBox",
          displayExpr: "key",

          displayName: "Function",
          name: "func",
          saveValue: true,
        },
        { componentName: "CheckBox", name: "skip" },
        { componentName: "TextArea", name: "skipRow" },
      ],
      componentName: "DynamicTable",
      name: "meta",
    },
  ],
  isRealTime: true,
  name: "Import",
  title: "Simple Insert",
};
