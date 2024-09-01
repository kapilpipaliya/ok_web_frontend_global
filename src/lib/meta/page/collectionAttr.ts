import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { PROPERTIES } from "~/components/constants/constant";

export const collectionAttr = [
  {
    componentName: "SystemString",
    key: "displayName",
    onchange: '{"new": ["key","id"], "edit": ["key","id"]}',
  },
  {
    componentName: "SystemString",
    displayName: "ID",
    key: "key",
  },
  {
    class: PROPERTIES.Css.TextField,
    componentName: "SystemTextArea",
    key: "definition",
  },
  {
    collection: "g:'DataType'",
    componentName: "SelectBox",

    key: "dataType",
  },
  {
    collection: "->$0DataType->$0Comp",
    componentName: "SelectBox",

    key: "Comp",
    // smaller version:
    // collection: "g:'Comp'",
  },
  {
    collection: "g:'Coll'",
    componentName: "SelectBox",

    key: "coll",
  },
  {
    componentName: "SystemBoolean",
    key: "required",
  },
  {
    componentName: "SystemBoolean",
    key: "disabled",
  },
  {
    componentName: "TagBox",
    key: "hidden",
  },
  {
    componentName: "TagBox",
    key: "disabled",
  },
  {
    attributes: [
      {
        collection: "<-$0->$0Comp->$0Prop",
        componentName: "SelectBox",

        displayExpr: "::'P.key'",
        key: "key",
      },
      {
        componentName:
          "->$0Name->$0Comp<-CompChild::'P.key'||->$0Name->$0Comp::'P.key'||->$0Name->$0DataType->$0Default::'P.key'",
        key: "value",
        meta: "(->$0Name->$0Comp<-CompChild->$0Prop)++(->$0Name->$0Comp->$0Prop)++(->$0Name->$0ValueProp)",
      },
    ],
    componentName: "DynamicTable",
    displayName: "Properties",
    key: "Prop",
  },
  /*{
    attributes: [
      {
        collection: "g:'Role'",
        componentName: "SelectBox",

        key: "role",
      },
      {
        attributes: [
          {
            collection: "g:'Perm'",
            componentName: "TagBox",

            key: "perm",
          },
          {
            componentName: "SystemString",
            key: "scope",
            attributes: [
              SystemString
            ],
          },
        ],
        componentName: "DynamicTable",
        key: "Perm",
      },
    ],
    componentName: "DynamicTable",
    displayName: "Permissions",
    key: "Role",
  },*/
  {
    componentName: "DynamicTable",
    key: "Attr",
    label: "Attr",

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
