import { textFieldInputMeta, textFieldTextAreaMeta } from "~/components/constants/textFieldInput";

export const Import = {
  attributes: [
    {
      componentName: "TextField",
      height: 500,
      name: "csv",
      width: 600,
      attributes: [
        textFieldTextAreaMeta
      ]
    },
    { componentName: "TextField", name: "label", attributes: [textFieldInputMeta] },
    { componentName: "CheckBox", name: "dry" },
    { componentName: "TextField", name: "lookup", attributes: [textFieldInputMeta] },
    { componentName: "TextField", name: "lookupId", attributes: [textFieldInputMeta] },
    { componentName: "TextField", name: "lookupChild", attributes: [textFieldInputMeta] },
    {
      attributes: [
        { componentName: "TextField", name: "column", attributes: [textFieldInputMeta] },
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
          attributes: [textFieldInputMeta]
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
          attributes: [textFieldInputMeta]
        },
        { componentName: "CheckBox", name: "inward" },
        {
          componentName: "TextField",
          displayName: "Lookup Collection ID",
          name: "collId",
          attributes: [textFieldInputMeta]
        },
        { componentName: "TextField", displayName: "Edge Type", name: "edge", attributes: [textFieldInputMeta] },
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
        { componentName: "TextField", name: "skipRow", attributes: [textFieldTextAreaMeta] },
      ],
      componentName: "DynamicTable",
      name: "meta",
    },
  ],
  isRealTime: true,
  name: "Import",
  title: "Simple Insert",
};
