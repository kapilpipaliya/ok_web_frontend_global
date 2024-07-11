import type { IFormMetaData } from "~/lib/FormMetadataType";

export const Comp: IFormMetaData = {
  attributes: [
    {
      collection: "g:'CompCategory'",
      component: "SelectBox",

      inward: true,
      name: "category",
      parentLabel: "CompCategory",
    },
    { component: "TextBox", name: "name" },
    { component: "TextBox", name: "label" },
    {
      childLabel: "Child",
      collection: "g:'Comp'",
      component: "SelectBox",

      displayName: "Parent Component",
      inward: true,
      name: "parent",
      parentLabel: "Comp",
    },
    {
      collection: "g:'DataType'",
      component: "TagBox",
      displayName: "DataType",

      inward: true,
      name: "dataType",
      parentLabel: "DataType",
    },
    {
      component: "CheckBox",
      displayName: "Children",
      name: "child",
    },
    {
      component: "CheckBox",
      displayName: "Required",
      name: "required",
    },
    { component: "TextArea", name: "description" },
    // TODO: add validation, duplicate row with same name is not allowed.
    {
      attributes: [
        {
          component: "TextBox",
          name: "name",
        },
        {
          component: "TextBox",
          name: "label",
        },
        {
          component: "CheckBox",
          name: "required",
        },
        {
          collection: "g:'DataType'",
          component: "SelectBox",

          name: "dataType",
          onchange: '["Comp",null]',
        },
        {
          collection: "->$0DataType->$0Comp",
          component: "SelectBox",
          displayName: "Component",

          name: "Comp",
        },
        {
          attributes: [
            {
              collection: "<-$0->$0Comp->$0Prop",
              component: "SelectBox",
              displayExpr: "::'P.name'",
              name: "name",
            },
            {
              component: "->$0Name->$0Comp<-CompChild::'P.name'||->$0Name->$0Comp::'P.name'",
              meta: "->$0Name->$0Comp<-CompChild->$0Prop++->$0Name->$0Comp->$0Prop",
              name: "value",
            },
          ],
          component: "DynamicTable",
          displayName: "Value Property",
          // TODO: Be sure the name is ok, it will not change in production.
          name: "valueProp",
          tab: "Properties",
        },
        {
          component: "->$0Comp<-CompChild::'P.name'||->$0Comp::'P.name'||->$0DataType->$0Default::'P.name'",
          meta: "->$0Comp<-CompChild->$0Prop++->$0Comp->$0Prop++->$0ValueProp",
          name: "value",
          // component: "->$0Comp<-CompChild::'P.name'||->$0Comp::'P.name'||->$0DataType->$0Default::'P.name'||defaultComp|->$0DataType::'P.name'",
        },
        {
          component: "TextArea",
          name: "description",

          // autoResizeEnabled: true,
          width: "550px",
        },
        {
          children: "Reset",
          class: "border-color:#FF0000 color:#FF0000",

          component: "Button",
          name: "reset",
          variant: "outlined",
          // TODO:
          // function: "reset",
          // onchange: '{"new": ["value","clear"], "edit": ["value","clear"]}',
        },
      ],
      component: "DynamicTable",
      name: "Prop",
      tab: "Properties",
    },
    {
      attributes: [
        {
          component: "TextBox",
          name: "name",
        },
        {
          component: "TextBox",
          name: "label",
        },
        {
          component: "TextArea",
          name: "description",

          // autoResizeEnabled: true,
          width: "550px",
        },
      ],
      component: "DynamicTable",
      name: "Event",
      tab: "Events",
    },
  ],
  isInlineEditable: false,
  name: "Comp",
  title: "Component",
};
