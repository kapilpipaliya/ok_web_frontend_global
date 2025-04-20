import { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import { PROPERTIES } from "~/pages/settings/constants";

export const Import = {
  attributes: [
    {
      css: PROPERTIES.Css.TextFieldCss,
      componentName: "TextArea",
      height: 500,
      key: "csv",
      width: 600,
    },
    {
      componentName: "TextInput",
      key: "label",
    },
    { componentName: "CheckBox", key: "dry" },
    {
      componentName: "TextInput",
      key: "lookup",
    },
    {
      componentName: "TextInput",
      key: "lookupId",
    },
    {
      componentName: "TextInput",
      key: "lookupChild",
    },
    {
      attributes: [
        {
          componentName: "TextInput",
          key: "column",
        },
        // {
        //  key: "column",
        //  componentName: "Select",
        //
        //   displayExpr: "key",
        //   collection: "Update Dynamically on meta based on first row",
        //  },
        // },
        {
          componentName: "TextInput",
          displayName: "Attribute ID",
          key: "attrId",
        },
        {
          collection: "g:'Form'",
          componentName: "Select",
          displayExpr: "key",

          displayName: "Lookup Collection",
          key: "coll",
        },
        {
          componentName: "TextInput",
          displayName: "Lookup Label",
          key: "collLabel",
        },
        { componentName: "CheckBox", key: "inward" },
        {
          componentName: "TextInput",
          displayName: "Lookup Collection ID",
          key: "collId",
        },
        {
          componentName: "TextInput",
          displayName: "Edge Type",
          key: "edge",
        },
        {
          collection:
            '[{"key":"dataType","id":"dataType"}, {"id": "lookup", "key": "lookup"}]',
          componentName: "Select",
          displayExpr: "key",

          displayName: "Function",
          key: "func",
          saveValue: true,
        },
        { componentName: "CheckBox", key: "skip" },
        {
          css: PROPERTIES.Css.TextFieldCss,
          componentName: "TextArea",
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
