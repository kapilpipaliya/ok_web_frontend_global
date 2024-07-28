import type { IFormContext } from "~/components/form/FormContext";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { findVertexByLabelAndUniqueIdWithSkip } from "~/lib/graph/get/sync/findVertex";

import { binopsInitial, unaryOperatorsInitial } from "../../expression_eval";
import { useGraph } from "../../graph/graph";
import { FormMetaData } from "../formMetaData";
import { FormMetaDataAuth } from "../formMetaDataAuth";
import { collectionAttr } from "./collectionAttr";

export const Coll: IFormMetaData = {
  attributes: [
    {
      componentName: "TextBox",
      name: "title",

      onchange: '{"new": ["name","id"]}',
    },
    {
      componentName: "TextBox",
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
      componentName: "SelectBox",

      inward: true,
      name: "category",
      parentLabel: "CollCategory",
    },
    {
      collection: "g:'Dashboard'",
      componentName: "TagBox",

      inward: true,
      name: "dashboard",
      parentLabel: "Dashboard",
    },
    { componentName: "TextArea", name: "description" },
    { componentName: "CheckBox", name: "public" },
    { componentName: "CheckBox", name: "isInlineEditable" },
    // { name: "supportCustomFields", componentName: "CheckBox" },
    // { name: "searchOnly", componentName: "CheckBox" },
    // { name: "supportDeletedRecordSearch", componentName: "CheckBox" },
    {
      collection: "->Attr",
      componentName: "TagBox",
      displayName: "Primary Key",

      name: "pk",
      // TODO: add validation
      // If there is not name attribute,
      // then this field is required.
    },
    {
      collection: "->Attr",
      componentName: "TagBox",

      name: "nameKey",
      // TODO: add validation
      // If there is not name attribute,
      // then this field is required.
    },

    {
      attributes: collectionAttr,
      componentName: "DynamicTable",
      label: "Attr",

      name: "Attr",
      tab: "Attribute",

      type: "Attr",
    },
    {
      attributes: [
        {
          componentName: "TextBox",
          name: "name",
        },
        // {
        //   componentName: "TextBox",
        //   name: "label",
        // },
        {
          attributes: [
            {
              componentName: "SelectBox",
              displayName: "Paren",
              name: "leftParen",

              options: `(
((
(((`,
            },
            {
              componentName: "SelectBox",
              displayName: "Field",
              name: "leftField",
              // collection: "g:'DataType'",
            },
            // {
            //   componentName: "TextBox",
            //   displayName: "Value",
            //   name: "leftValue",
            // },
            {
              componentName: "SelectBox",
              displayName: "Operator",
              name: "operator",
              options: `${Object.keys(unaryOperatorsInitial).join("\n")}
${Object.keys(binopsInitial).join("\n")}`,
            },
            {
              componentName: "SelectBox",
              displayName: "Field",
              name: "rightField",
              // collection: "g:'DataType'",
            },
            /*{
              componentName: "TextBox",
              displayName: "Value",
              name: "rightValue",
            },
            {
              collection: "g:'DataType'",
              componentName: "SelectBox",
              displayName: "DataType",
              
                name: "dataType",
              
            },
            {
              collection: "->$0DataType->$0Comp||Comp",
              componentName: "SelectBox",
              displayName: "Component",
              
                name: "comp",
              
            },*/
            {
              componentName: `->$0RightField->$0Comp<-CompChild::'P.name'||->$0RightField->$0Comp::'P.name'||->$0RightField->$0DataType->$0Default::'P.name'`,
              displayName: "Value",
              meta: "(->$0Comp<-CompChild->$0Prop)++(->$0Comp->$0Prop)++(->$0ValueProp)",
              name: "rightValue",
            },
            {
              componentName: "SelectBox",
              displayName: "Paren",
              name: "rightParen",

              options: `)
))
)))`,
            },
            {
              componentName: "SelectBox",
              displayName: "AndOr",
              name: "andOr",

              options: `${Object.keys(binopsInitial).join("\n")}`,
            },
          ],
          componentName: "DynamicTable",
          displayName: "Conditions",
          name: "cond",
        },
      ],
      componentName: "DynamicTable",
      label: "Rule",

      name: "Rule",
      tab: "Rules",

      type: "Rule",
    },

    /*      {
                  name: "Child",
                  componentName: "DynamicTable",
                  tab: "Child",
                  attributes: [
                    {
                      name: "coll",
                      componentName: "SelectBox",
                      
 
                        collection: "g:'Coll'",
                      
                    },
                    {
                      name: "displayName",
                      componentName: "TextBox",
                      
                        onchange: '{"new": ["name","id"], "edit": ["name","id"]}',
                      
                    },
                    {
                      name: "name",
                      componentName: "TextBox",
                    },
                    {
                      name: "tab",
                      componentName: "SelectBox",
                      
 
                        collection: "-CollChild->$0Tab",
                      
                    },
                    {
                      name: "group",
                      componentName: "SelectBox",
                      
                        collection: "-CollChild->$0Group",
 
                      
                    },
                    {
                      name: "Prop",
                      displayName: "Property",
                      componentName: "DynamicTable",
                      attributes: [
                        {
                          name: "name",
                          componentName: "SelectBox",
                          
                            displayExpr: "::'P.name'",
                            collection: "g:'Comp[Table]'->$0Prop",
                          
                        },
                        {
                          name: "value",
                          meta: "(->$0Name->$0Comp<-CompChild->$0Prop)++(->$0Name->$0Comp->$0Prop)++(->$0Name->$0ValueProp)",
                          componentName: "->$0Name->$0Comp<-CompChild::'P.name'||->$0Name->$0Comp::'P.name'",
                        },
                      ],
                    },
                  ],
                },*/
    {
      attributes: [
        {
          collection: "g:'Coll'",
          componentName: "SelectBox",

          name: "coll",
        },
        {
          componentName: "TextBox",
          name: "displayName",
        },
        {
          componentName: "TextBox",
          name: "fieldDefaults",
        },
        {
          attributes: [
            {
              collection: "g:'Comp[Table]'->$0Prop",
              componentName: "SelectBox",

              displayExpr: "::'P.name'",
              name: "name",
            },
            {
              componentName: "->$0Name->$0Comp<-CompChild::'P.name'||->$0Name->$0Comp::'P.name'",
              meta: "(->$0Name->$0Comp<-CompChild->$0Prop)++(->$0Name->$0Comp->$0Prop)++(->$0Name->$0ValueProp)",
              name: "value",
            },
          ],
          componentName: "DynamicTable",
          displayName: "Property",
          name: "Prop",
        },
      ],
      componentName: "DynamicTable",
      name: "Transform",
      tab: "Transform",
    },
    {
      attributes: [
        {
          componentName: "TextBox",
          name: "name",
        },
        {
          collection: "g:'Role'",
          componentName: "TagBox",
          name: "role",
        },
        {
          collection: "g:'Perm'",
          componentName: "TagBox",
          name: "perm",
        },
        {
          componentName: "TextBox",
          name: "scope",
        },
      ],
      componentName: "DynamicTable",
      name: "Perm",
      tab: "Permission",
    },
    {
      attributes: [
        {
          collection: "<-$0->Attr",
          componentName: "TagBox",
          displayName: "Unique Constrain Keys",

          name: "pk",
        },
      ],
      componentName: "DynamicTable",
      name: "uniqueConstrain",
      tab: "Unique Constrain",
    },
  ],
  name: "Coll",
  title: "Collection",
};
