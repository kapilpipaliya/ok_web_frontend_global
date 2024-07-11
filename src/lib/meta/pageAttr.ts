import type { FieldAttribute } from "~/lib/FormMetadataType";


export const pageAttr = [
  {
    collection: "g:'ALL_LABELS'",
    component: "SelectBox",
    displayName: "Collection",
    name: "collection",
    saveValue: true,
  },
  {
    // collection: "->$0Coll->Attr||-$0->$0Coll->Attr",
    component: "SelectBox",
    // displayExpr: "P.displayName||P.name",
    displayExpr: "$P.displayName ($P.name)",
    displayName: "Data",
    name: "data",
  },
  {
    component: "TextBox",
    displayName: "ID",
    name: "name",
  },
  {
    component: "TagBox",
    name: "hidden",
  },
  // {
  //   name: "definition",
  //   component: "TextArea",
  // },
  // {
  //   name: "parent",
  //   component: "SelectBox",
  //
  //
  //     collection: "<-$0->Attr",
  //     focusRefresh: true
  // },
  {
    collection: `g:'{{->$0Coll::'P.name'}}'`,
    component: "SelectBox",

    name: "data",
  },
  {
    collection: "g:'Comp'",
    component: "SelectBox",

    name: "Comp",
    // smaller version:
    // collection: "g:'Comp'",
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
    displayName: "Property",
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
            component: "SelectBox",

            name: "perm",
          },
        ],
        component: "DynamicTable",
        name: "Perm",
      },
    ],
    component: "DynamicTable",
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

let pageChildAttrs: FieldAttribute = pageAttr[pageAttr.length - 1];
// Keep max level 10, else the Page navigation is very slow. because revert transaction on record takes so much time.
for (let i = 0; i < 10; i++) {
  const attributes = JSON.parse(JSON.stringify(pageAttr));
  pageChildAttrs.attributes = attributes;
  pageChildAttrs = attributes[attributes.length - 1];
}