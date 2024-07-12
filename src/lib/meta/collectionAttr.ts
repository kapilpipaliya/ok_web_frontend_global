import type { FieldAttribute } from "~/lib/FormMetadataType";


export const collectionAttr = [
  {
    component: "TextBox",
    name: "displayName",

    onchange: '{"new": ["name","id"], "edit": ["name","id"]}',
  },
  {
    component: "TextBox",
    displayName: "ID",
    name: "name",
  },
  {
    component: "TextArea",
    name: "definition",
  },
  {
    collection: "g:'DataType'",
    component: "SelectBox",

    name: "dataType",
  },
  {
    collection: "->$0DataType->$0Comp",
    component: "SelectBox",

    name: "Comp",
    // smaller version:
    // collection: "g:'Comp'",
  },
  {
    collection: "g:'Coll'",
    component: "SelectBox",

    name: "coll",
  },
  {
    component: "CheckBox",
    name: "required",
  },
  {
    component: "CheckBox",
    name: "disabled",
  },
  {
    component: "TagBox",
    name: "hidden",
  },
  {
    component: "TagBox",
    name: "disabled",
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
        component: "->$0Name->$0Comp<-CompChild::'P.name'||->$0Name->$0Comp::'P.name'||->$0Name->$0DataType->$0Default::'P.name'",
        meta: "->$0Name->$0Comp<-CompChild->$0Prop++->$0Name->$0Comp->$0Prop++->$0Name->$0ValueProp",
        name: "value",
      },
    ],
    component: "DynamicTable",
    displayName: "Properties",
    name: "Prop",
  },
  {
    attributes: [
      {
        collection: "g:'Role'",
        component: "SelectBox",

        name: "role",
      },
      {
        attributes: [
          {
            collection: "g:'Perm'",
            component: "TagBox",

            name: "perm",
          },
          {
            component: "TextBox",
            name: "scope",
          },
        ],
        component: "DynamicTable",
        name: "Perm",
      },
    ],
    component: "DynamicTable",
    displayName: "Permissions",
    name: "Role",
  },
  {
    component: "DynamicTable",
    label: "Attr",
    name: "Attr",

    tab: "expand",
    type: "Attr",
  },
] as FieldAttribute[];

let childAttrs: FieldAttribute = collectionAttr[collectionAttr.length - 1];
for (let i = 0; i < 5; i++) {
  const attributes = JSON.parse(JSON.stringify(collectionAttr));
  childAttrs.attributes = attributes;
  childAttrs = attributes[attributes.length - 1];
}