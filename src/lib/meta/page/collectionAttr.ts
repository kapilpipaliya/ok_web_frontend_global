import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { textFieldInputMeta, textFieldTextAreaMeta } from "~/components/constants/textFieldInput";

export const collectionAttr = [
  {
    attributes: [
      textFieldInputMeta
    ],
    componentName: "TextField",
    name: "displayName",
    onchange: '{"new": ["name","id"], "edit": ["name","id"]}',
  },
  {
    attributes: [
      textFieldInputMeta
    ],
    componentName: "TextField",
    displayName: "ID",
    name: "name",
  },
  {
    attributes: [
      textFieldTextAreaMeta
    ],
    componentName: "TextField",
    name: "definition",
  },
  {
    collection: "g:'DataType'",
    componentName: "SelectBox",

    name: "dataType",
  },
  {
    collection: "->$0DataType->$0Comp",
    componentName: "SelectBox",

    name: "Comp",
    // smaller version:
    // collection: "g:'Comp'",
  },
  {
    collection: "g:'Coll'",
    componentName: "SelectBox",

    name: "coll",
  },
  {
    componentName: "CheckBox",
    name: "required",
  },
  {
    componentName: "CheckBox",
    name: "disabled",
  },
  {
    componentName: "TagBox",
    name: "hidden",
  },
  {
    componentName: "TagBox",
    name: "disabled",
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
    displayName: "Properties",
    name: "Prop",
  },
  /*{
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
            componentName: "TagBox",

            name: "perm",
          },
          {
            componentName: "TextField",
            name: "scope",
            attributes: [
              textFieldInputMeta
            ],
          },
        ],
        componentName: "DynamicTable",
        name: "Perm",
      },
    ],
    componentName: "DynamicTable",
    displayName: "Permissions",
    name: "Role",
  },*/
  {
    componentName: "DynamicTable",
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
