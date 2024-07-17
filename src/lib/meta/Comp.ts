import type { IFormMetaData } from "~/lib/FormMetadataType";

export const Comp: IFormMetaData = {
  attributes: [
    {
      collection: "g:'CompCategory'",
      componentName: "SelectBox",

      inward: true,
      name: "category",
      parentLabel: "CompCategory",
    },
    { componentName: "TextBox", name: "name" },
    { componentName: "TextBox", name: "label" },
    {
      childLabel: "Child",
      collection: "g:'Comp'",
      componentName: "SelectBox",

      displayName: "Parent Component",
      inward: true,
      name: "parent",
      parentLabel: "Comp",
    },
    {
      collection: "g:'DataType'",
      componentName: "TagBox",
      displayName: "DataType",

      inward: true,
      name: "dataType",
      parentLabel: "DataType",
    },
    {
      componentName: "CheckBox",
      displayName: "Children",
      name: "child",
    },
    {
      componentName: "CheckBox",
      displayName: "Required",
      name: "required",
    },
    { componentName: "TextArea", name: "description" },
    // TODO: add validation, duplicate row with same name is not allowed.
    {
      attributes: [
        {
          componentName: "TextBox",
          name: "name",
        },
        {
          componentName: "TextBox",
          name: "label",
        },
        {
          componentName: "CheckBox",
          name: "required",
        },
        {
          collection: "g:'DataType'",
          componentName: "SelectBox",

          name: "dataType",
          onchange: '["Comp",null]',
        },
        {
          collection: "->$0DataType->$0Comp",
          componentName: "SelectBox",
          displayName: "Component",

          name: "Comp",
        },
        {
          attributes: [
            {
              collection: "<-$0->$0Comp->$0Prop",
              componentName: "SelectBox",
              displayExpr: "::'P.name'",
              name: "name",
            },
            {
              componentName: "->$0Name->$0Comp<-CompChild::'P.name'||->$0Name->$0Comp::'P.name'",
              meta: "->$0Name->$0Comp<-CompChild->$0Prop++->$0Name->$0Comp->$0Prop",
              name: "value",
            },
          ],
          componentName: "DynamicTable",
          displayName: "Value Property",
          // TODO: Be sure the name is ok, it will not change in production.
          name: "valueProp",
          tab: "Properties",
        },
        {
          componentName: "->$0Comp<-CompChild::'P.name'||->$0Comp::'P.name'||->$0DataType->$0Default::'P.name'",
          meta: "->$0Comp<-CompChild->$0Prop++->$0Comp->$0Prop++->$0ValueProp",
          name: "value",
          // componentName: "->$0Comp<-CompChild::'P.name'||->$0Comp::'P.name'||->$0DataType->$0Default::'P.name'||defaultComp|->$0DataType::'P.name'",
        },
        {
          componentName: "TextArea",
          name: "description",

          // autoResizeEnabled: true,
          width: "550px",
        },
        {
          children: "Reset",
          class: "border-color:#FF0000 color:#FF0000",

          componentName: "Button",
          name: "reset",
          variant: "outlined",
          // TODO:
          // function: "reset",
          // onchange: '{"new": ["value","clear"], "edit": ["value","clear"]}',
        },
      ],
      componentName: "DynamicTable",
      name: "Prop",
      tab: "Properties",
    },
    {
      attributes: [
        {
          componentName: "TextBox",
          name: "name",
        },
        {
          componentName: "TextBox",
          name: "label",
        },
        {
          componentName: "TextArea",
          name: "description",

          // autoResizeEnabled: true,
          width: "550px",
        },
      ],
      componentName: "DynamicTable",
      name: "Event",
      tab: "Events",
    },
  ],
  isInlineEditable: false,
  name: "Comp",
  title: "Component",
};
