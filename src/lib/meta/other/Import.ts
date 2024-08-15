import { textFieldInputMeta, textFieldTextAreaMeta } from "~/components/constants/textFieldInput";

export const Import = {
  attributes: [
    {
      attributes: [
        textFieldTextAreaMeta
      ],
      componentName: "TextField",
      height: 500,
      name: "csv",
      width: 600
    },
    { attributes: [textFieldInputMeta], componentName: "TextField", name: "label" },
    { componentName: "CheckBox", name: "dry" },
    { attributes: [textFieldInputMeta], componentName: "TextField", name: "lookup" },
    { attributes: [textFieldInputMeta], componentName: "TextField", name: "lookupId" },
    { attributes: [textFieldInputMeta], componentName: "TextField", name: "lookupChild" },
    {
      attributes: [
        { attributes: [textFieldInputMeta], componentName: "TextField", name: "column" },
        // {
        //  name: "column",
        //  componentName: "SelectBox",
        //
        //   displayExpr: "key",
        //   collection: "Update Dynamically on meta based on first row",
        //  },
        // },
        {
          attributes: [textFieldInputMeta],
          componentName: "TextField",
          displayName: "Attribute ID",
          name: "attrId"
        },
        {
          collection: "g:'Form'",
          componentName: "SelectBox",
          displayExpr: "name",

          displayName: "Lookup Collection",
          name: "coll",
        },
        {
          attributes: [textFieldInputMeta],
          componentName: "TextField",
          displayName: "Lookup Label",
          name: "collLabel"
        },
        { componentName: "CheckBox", name: "inward" },
        {
          attributes: [textFieldInputMeta],
          componentName: "TextField",
          displayName: "Lookup Collection ID",
          name: "collId"
        },
        { attributes: [textFieldInputMeta], componentName: "TextField", displayName: "Edge Type", name: "edge" },
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
        { attributes: [textFieldTextAreaMeta], componentName: "TextField", name: "skipRow" },
      ],
      componentName: "DynamicTable",
      name: "meta",
    },
  ],
  isRealTime: true,
  name: "Import",
  title: "Simple Insert",
};
