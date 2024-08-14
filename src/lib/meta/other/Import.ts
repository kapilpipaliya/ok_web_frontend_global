export const Import = {
  attributes: [
    {
      componentName: "TextArea",
      height: 500,
      name: "csv",
      width: 600,
    },
    { componentName: "TextField", name: "label" },
    { componentName: "CheckBox", name: "dry" },
    { componentName: "TextField", name: "lookup" },
    { componentName: "TextField", name: "lookupId" },
    { componentName: "TextField", name: "lookupChild" },
    {
      attributes: [
        { componentName: "TextField", name: "column" },
        // {
        //  name: "column",
        //  componentName: "SelectBox",
        //
        //   displayExpr: "key",
        //   collection: "Update Dynamically on meta based on first row",
        //  },
        // },
        {
          componentName: "TextField",
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
          componentName: "TextField",
          displayName: "Lookup Label",
          name: "collLabel",
        },
        { componentName: "CheckBox", name: "inward" },
        {
          componentName: "TextField",
          displayName: "Lookup Collection ID",
          name: "collId",
        },
        { componentName: "TextField", displayName: "Edge Type", name: "edge" },
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
