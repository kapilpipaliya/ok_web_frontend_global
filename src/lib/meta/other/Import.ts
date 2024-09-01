import { PROPERTIES } from "~/components/constants/constant";

export const Import = {
  attributes: [
    {
      class: PROPERTIES.Css.TextField,
      componentName: "SystemTextArea",
      height: 500,
      key: "csv",
      width: 600,
    },
    {
      componentName: "SystemString",
      key: "label",
    },
    { componentName: "SystemBoolean", key: "dry" },
    {
      componentName: "SystemString",
      key: "lookup",
    },
    {
      componentName: "SystemString",
      key: "lookupId",
    },
    {
      componentName: "SystemString",
      key: "lookupChild",
    },
    {
      attributes: [
        {
          componentName: "SystemString",
          key: "column",
        },
        // {
        //  key: "column",
        //  componentName: "SelectBox",
        //
        //   displayExpr: "key",
        //   collection: "Update Dynamically on meta based on first row",
        //  },
        // },
        {
          componentName: "SystemString",
          displayName: "Attribute ID",
          key: "attrId",
        },
        {
          collection: "g:'Form'",
          componentName: "SelectBox",
          displayExpr: "key",

          displayName: "Lookup Collection",
          key: "coll",
        },
        {
          componentName: "SystemString",
          displayName: "Lookup Label",
          key: "collLabel",
        },
        { componentName: "SystemBoolean", key: "inward" },
        {
          componentName: "SystemString",
          displayName: "Lookup Collection ID",
          key: "collId",
        },
        {
          componentName: "SystemString",
          displayName: "Edge Type",
          key: "edge",
        },
        {
          collection:
            '[{"key":"dataType","id":"dataType"}, {"id": "lookup", "key": "lookup"}]',
          componentName: "SelectBox",
          displayExpr: "key",

          displayName: "Function",
          key: "func",
          saveValue: true,
        },
        { componentName: "SystemBoolean", key: "skip" },
        {
          class: PROPERTIES.Css.TextField,
          componentName: "SystemTextArea",
          key: "skipRow",
        },
      ],
      componentName: "DynamicTable",
      key: "meta",
    },
  ],
  isRealTime: true,
  key: "Import",
  title: "Simple Insert",
};
