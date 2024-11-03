import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { PROPERTIES } from "~/components/constants/constant";
export const parentCompAttribute = {
  collection: "g:'Comp'",
  componentName: "Select",
  displayName: "Parent Component",
  key: "ParentComp",
  type: "ParentComp",
  // validation: { required: true },
};
export const Comp: IFormMetaData = {
  attributes: [
    {
      collection: "g:'CompCategory'",
      componentName: "Select",

      inward: true,
      key: "category",
      parentLabel: "CompCategory",
    },
    {
      componentName: "SystemString",
      key: "key",
    },
    {
      componentName: "SystemString",
      key: "label",
    },
    {
      childLabel: "Child",
      collection: "g:'Comp'",
      componentName: "Select",

      displayName: "Parent Component",
      inward: true,
      key: "parent",
      parentLabel: "Comp",
    },
    {
      collection: "g:'DataType'",
      componentName: "MultiSelect",
      displayName: "DataType",

      inward: true,
      key: "dataType",
      parentLabel: "DataType",
    },
    {
      componentName: "SystemBoolean",
      displayName: "Children",
      key: "child",
    },
    // {
    //   componentName: "SystemBoolean",
    //   displayName: "Hidden",
    //   key: "hide",
    // },
    {
      class: PROPERTIES.Css.TextField,
      componentName: "SystemTextArea",
      key: "description",
    },
    parentCompAttribute,
    // TODO: add validation, duplicate row with same key is not allowed.
    {
      attributes: [
        {
          componentName: "SystemString",
          key: "key",
        },
        {
          componentName: "SystemString",
          key: "type",
        },
        {
          componentName: "SystemString",
          key: "default",
        },
        // {
        //   collection: "g:'DataType'",
        //   componentName: "Select",
        //   key: "dataType",
        //   onchange: '["Comp",null]',
        // },
        // {
        //   collection: "->$0DataType->$0Comp",
        //   componentName: "Select",
        //   displayName: "Component",
        //   key: "Comp",
        // },
        // {
        //   collection: "g:'CompExample'",
        //   componentName: "Select",
        //   displayName: "Comp Example",
        //   key: "CompExample",
        // },
        // {
        //   attributes: [
        //     {
        //       collection: "<-$0->$0Comp->$0Prop",
        //       componentName: "Select",
        //       displayExpr: "::'P.key'",
        //       key: "key",
        //     },
        //     {
        //       componentName:
        //         "->$0Name->$0Comp<-CompChild::'P.key'||->$0Name->$0Comp::'P.key'",
        //       meta: "->$0Name->$0Comp<-CompChild->$0Prop++->$0Name->$0Comp->$0Prop",
        //       key: "value",
        //     },
        //   ],
        //   componentName: "DynamicTable",
        //   displayName: "Value Property",
        //   // TODO: Be sure the key is ok, it will not change in production.
        //   key: "valueProp",
        //   tab: "Properties",
        // },
        // {
        //   componentName:
        //     "->$0Comp<-CompChild::'P.key'||->$0Comp::'P.key'||->$0DataType->$0Default::'P.key'",
        //   meta: "(->$0Comp<-CompChild->$0Prop)++(->$0Comp->$0Prop)++(->$0ValueProp)",
        //   key: "value",
        //   // componentName: "->$0Comp<-CompChild::'P.key'||->$0Comp::'P.key'||->$0DataType->$0Default::'P.key'||defaultComp|->$0DataType::'P.key'",
        // },
        {
          class: PROPERTIES.Css.TextField,
          componentName: "SystemTextArea",
          key: "description",
          // autoResizeEnabled: true,
          width: "550px",
        },
        // {
        //   children: "Reset",
        //   class: "border-color:#FF0000 color:#FF0000",

        //   componentName: "Button",
        //   key: "reset",
        //   variant: "outlined",
        //   // TODO:
        //   // function: "reset",
        //   // onchange: '{"new": ["value","clear"], "edit": ["value","clear"]}',
        // },
      ],
      componentName: "DynamicTable",
      key: "Prop",
      tab: "Properties",
    },
    {
      attributes: [
        {
          componentName: "SystemString",
          key: "key",
        },
        {
          componentName: "SystemString",
          key: "label",
        },
        {
          class: PROPERTIES.Css.TextField,
          componentName: "SystemTextArea",
          key: "description",

          // autoResizeEnabled: true,
          width: "550px",
        },
      ],
      componentName: "DynamicTable",
      key: "Event",
      tab: "Events",
    },
  ],
  isInlineEditable: false,
  key: "Comp",
  title: "Component",
};
