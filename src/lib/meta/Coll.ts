import type { IFormMetaData } from "~/lib/FormMetadataType";
import type { IFormContext } from "~/lib/contexts";

import { findVertexByLabelAndUniqueIdWithSkip } from "~/lib/graph/get/sync/findVertex";

import { binopsInitial, unaryOperatorsInitial } from "../expression_eval";
import { FormMetaData } from "./formMetaData";
import { FormMetaDataAuth } from "./formMetaDataAuth";
import { useGraph } from "../graph/graph";
import { collectionAttr } from "./collectionAttr";

export const Coll: IFormMetaData = {
  attributes: [
    {
      component: "TextBox",
      name: "title",

      onchange: '{"new": ["name","id"]}',
    },
    {
      component: "TextBox",
      name: "name",

      validationRules: [
        {
          message: "ID is required",
          type: "required",
        },
        {
          ignoreEmptyValue: true,
          message: "This ID is already taken",
          type: "custom",
          validationCallback: (options: any) => {
            const { formData } = (options.validator.context as IFormContext) ||
              ({} as IFormContext);
            const [graph, setGraph] = useGraph();
            const val = options.value;
            if (Object.keys(FormMetaData).includes(val) ||
              Object.keys(FormMetaDataAuth).includes(val)) {
              return false;
            }
            return !findVertexByLabelAndUniqueIdWithSkip(
              "Form",
              "id",
              val,
              formData.id,
              graph
            );
          },
        },
        // , {
        //   type: 'email',
        //   message: 'Email is invalid',
        // }
      ],
    },
    {
      collection: "g:'CollCategory'",
      component: "SelectBox",

      inward: true,
      name: "category",
      parentLabel: "CollCategory",
    },
    {
      collection: "g:'Dashboard'",
      component: "TagBox",

      inward: true,
      name: "dashboard",
      parentLabel: "Dashboard",
    },
    { component: "TextArea", name: "description" },
    { component: "CheckBox", name: "public" },
    { component: "CheckBox", name: "isInlineEditable" },
    // { name: "supportCustomFields", component: "CheckBox" },
    // { name: "searchOnly", component: "CheckBox" },
    // { name: "supportDeletedRecordSearch", component: "CheckBox" },
    {
      collection: "->Attr",
      component: "TagBox",
      displayName: "Primary Key",

      name: "pk",
      // TODO: add validation
      // If there is not name attribute,
      // then this field is required.
    },
    {
      collection: "->Attr",
      component: "TagBox",

      name: "nameKey",
      // TODO: add validation
      // If there is not name attribute,
      // then this field is required.
    },

    {
      attributes: collectionAttr,
      component: "DynamicTable",
      label: "Attr",

      name: "Attr",
      tab: "Attribute",

      type: "Attr",
    },
    {
      attributes: [
        {
          component: "TextBox",
          name: "name",
        },
        // {
        //   component: "TextBox",
        //   name: "label",
        // },
        {
          attributes: [
            {
              component: "SelectBox",
              displayName: "Paren",
              name: "left",

              options: `(
((
(((`,
            },
            {
              component: "SelectBox",
              displayName: "Field",
              name: "leftField",
              // collection: "g:'DataType'",
            },
            // {
            //   component: "TextBox",
            //   displayName: "Value",
            //   name: "leftValue",
            // },
            {
              component: "SelectBox",
              displayName: "Operator",
              name: "operator",
              options: `${Object.keys(unaryOperatorsInitial).join("\n")}
${Object.keys(binopsInitial).join("\n")}`,
            },
            {
              component: "SelectBox",
              displayName: "Field",
              name: "rightField",
              // collection: "g:'DataType'",
            },
            {
              component: "TextBox",
              displayName: "Value",
              name: "rightValue",
            },
            /* {
              collection: "g:'DataType'",
              component: "SelectBox",
              displayName: "DataType",
              
                name: "dataType",
              
            },
            {
              collection: "->$0DataType->$0Comp||Comp",
              component: "SelectBox",
              displayName: "Component",
              
                name: "comp",
              
            },
            {
              component: `->$0Comp<-CompChild::'P.name'||->$0Comp::'P.name'||->$0DataType->$0Default::'P.name'`,
              displayName: "Value",
              meta: "->$0Comp<-CompChild->$0Prop++->$0Comp->$0Prop++->$0ValueProp",
              name: "value",
            },*/
            {
              component: "SelectBox",
              displayName: "Paren",
              name: "right",

              options: `)
))
)))`,
            },
            {
              component: "SelectBox",
              displayName: "AndOr",
              name: "andOr",

              options: `AND
OR`,
            },
          ],
          component: "DynamicTable",
          displayName: "Conditions",
          name: "cond",
        },
      ],
      component: "DynamicTable",
      label: "Rules",

      name: "Rules",
      tab: "Rules",

      type: "Rule",
    },

    /*      {
                  name: "Child",
                  component: "DynamicTable",
                  tab: "Child",
                  attributes: [
                    {
                      name: "coll",
                      component: "SelectBox",
                      
 
                        collection: "g:'Coll'",
                      
                    },
                    {
                      name: "displayName",
                      component: "TextBox",
                      
                        onchange: '{"new": ["name","id"], "edit": ["name","id"]}',
                      
                    },
                    {
                      name: "name",
                      component: "TextBox",
                    },
                    {
                      name: "tab",
                      component: "SelectBox",
                      
 
                        collection: "-CollChild->$0Tab",
                      
                    },
                    {
                      name: "group",
                      component: "SelectBox",
                      
                        collection: "-CollChild->$0Group",
 
                      
                    },
                    {
                      name: "Prop",
                      displayName: "Property",
                      component: "DynamicTable",
                      attributes: [
                        {
                          name: "name",
                          component: "SelectBox",
                          
                            displayExpr: "::'P.name'",
                            collection: "g:'Comp[Table]'->$0Prop",
                          
                        },
                        {
                          name: "value",
                          meta: "->$0Name->$0Comp<-CompChild->$0Prop++->$0Name->$0Comp->$0Prop++->$0Name->$0ValueProp",
                          component: "->$0Name->$0Comp<-CompChild::'P.name'||->$0Name->$0Comp::'P.name'",
                        },
                      ],
                    },
                  ],
                },*/
    {
      attributes: [
        {
          collection: "g:'Coll'",
          component: "SelectBox",

          name: "coll",
        },
        {
          component: "TextBox",
          name: "displayName",
        },
        {
          component: "TextBox",
          name: "fieldDefaults",
        },
        {
          attributes: [
            {
              collection: "g:'Comp[Table]'->$0Prop",
              component: "SelectBox",

              displayExpr: "::'P.name'",
              name: "name",
            },
            {
              component: "->$0Name->$0Comp<-CompChild::'P.name'||->$0Name->$0Comp::'P.name'",
              meta: "->$0Name->$0Comp<-CompChild->$0Prop++->$0Name->$0Comp->$0Prop++->$0Name->$0ValueProp",
              name: "value",
            },
          ],
          component: "DynamicTable",
          displayName: "Property",
          name: "Prop",
        },
      ],
      component: "DynamicTable",
      name: "Transform",
      tab: "Transform",
    },
    {
      attributes: [
        {
          collection: "g:'Role'",
          component: "SelectBox",

          name: "role",
        },
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
      name: "Role",
      tab: "Permission",
    },
    {
      attributes: [
        {
          collection: "<-$0->Attr",
          component: "TagBox",
          displayName: "Unique Constrain Keys",

          name: "pk",
        },
      ],
      component: "DynamicTable",
      name: "uniqueConstrain",
      tab: "Unique Constrain",
    },
  ],
  name: "Coll",
  title: "Collection",
};
