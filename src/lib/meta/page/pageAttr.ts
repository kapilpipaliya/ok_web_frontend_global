import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { textFieldInputMeta } from "~/components/constants/textFieldInput";

export const pageAttr = [
  {
    collection: "g:'ALL_LABELS'",
    componentName: "SelectBox",
    displayName: "Collection",
    name: "collection",
    saveValue: true,
  },
  {
    // collection: "->$0Coll->Attr||-$0->$0Coll->Attr",
    componentName: "SelectBox",
    // displayExpr: "P.displayName||P.name",
    displayExpr: "$P.displayName ($P.name)",
    displayName: "Data",
    name: "data",
  },
  {
    attributes: [textFieldInputMeta],
    componentName: "TextField",
    displayName: "ID",
    name: "name",
  },
  // to load initial data
  {
    componentName: "TagBox",
    name: "All",
    type: "'*'",
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
        componentName:
          "->$0Name->$0Comp<-CompChild::'P.name'||->$0Name->$0Comp::'P.name'||->$0Name->$0DataType->$0Default::'P.name'",
        meta: "(->$0Name->$0Comp<-CompChild->$0Prop)++(->$0Name->$0Comp->$0Prop)++(->$0Name->$0ValueProp)",
        name: "value",
      },
    ],
    componentName: "DynamicTable",
    displayName: "Property",
    name: "Prop",
  },
  {
    attributes: [
      {
        collection: "g:'Role'",
        componentName: "SelectBox",

        name: "role",
      },
      {
        attributes: [
          {
            collection: "g:'Perm'",
            componentName: "SelectBox",

            name: "perm",
          },
        ],
        componentName: "DynamicTable",
        name: "Perm",
      },
    ],
    componentName: "DynamicTable",
    name: "Role",
  },
  {
    componentName: "DynamicTable",
    label: "Attr",
    name: "Attr",

    tab: "expand",
    type: "Attr",
  },
] as FieldAttribute[];

let pageChildAttrs: FieldAttribute = pageAttr[pageAttr.length - 1];
// Keep max level 10, else the Page navigation is very slow. because revert transaction on record takes so much time.
for (let i = 0; i < 10; i++) {
  const attributes = JSON.parse(JSON.stringify(pageAttr));
  pageChildAttrs.attributes = attributes;
  pageChildAttrs = attributes[attributes.length - 1];
}
