

import type { FieldAttribute, IFormMetaData } from "~/lib/FormMetadataType";
import type { IFormContext } from "~/lib/contexts";

import { FormMetaDataAuth } from "~/lib/formMetaDataAuth";
import { findVertexByLabelAndUniqueIdWithSkip } from "~/lib/graph/get/sync/findVertex";

import {  binopsInitial, unaryOperatorsInitial } from "./expression_eval";
import { useGraph } from "./graph/graph";

const collectionAttr = [
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
    attributes: [
      {
        collection: "<-$0->$0Comp->$0Prop",
        component: "SelectBox",
        
          displayExpr: "::'P.name'",
          name: "name",
        
      },
      {
        component:
          "->$0Name->$0Comp<-CompChild::'P.name'||->$0Name->$0Comp::'P.name'||->$0Name->$0DataType->$0Default::'P.name'",
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

const pageAttr = [
  {
    collection: "g:'ALL_LABELS'",
    component: "SelectBox",
    displayName: "Collection",
    name: "collection",
    saveValue: true
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
        component:
          "->$0Name->$0Comp<-CompChild::'P.name'||->$0Name->$0Comp::'P.name'||->$0Name->$0DataType->$0Default::'P.name'",
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
export const AdminAttrKeys = [
  "User",
  "Perm",
  "Role",
  "Dashboard",
  "Import",
  "Nav",
];
export const FormMetaData: { [key: string]: IFormMetaData } = {
  // TODO: Coll has only one Attr. Add validation for that.
  Coll: {
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
                const { formData } =
                  (options.validator.context as IFormContext) ||
                  ({} as IFormContext);
                const [graph, setGraph] = useGraph();
                const val = options.value;
                if (
                  Object.keys(FormMetaData).includes(val) ||
                  Object.keys(FormMetaDataAuth).includes(val)
                ) {
                  return false;
                }
                return !findVertexByLabelAndUniqueIdWithSkip(
                  "Form",
                  "id",
                  val,
                  formData.id,
                  graph,
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
                  options: `${Object.keys(unaryOperatorsInitial).join('\n')}
${Object.keys(binopsInitial).join('\n')}`,
                
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
          }
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
                component:
                  "->$0Name->$0Comp<-CompChild::'P.name'||->$0Name->$0Comp::'P.name'",
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
  },
  CollCategory: {
    attributes: [
      { component: "TextBox", name: "name" },
      { component: "TextBox", name: "label" },
      { component: "TextArea", name: "description" },
    ],
    isInlineEditable: true,
    name: "CollCategory",
    title: "Collection Category",
  },
  Comp: {
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
            component:
              "->$0Comp<-CompChild::'P.name'||->$0Comp::'P.name'||->$0DataType->$0Default::'P.name'",
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
  },
  CompCategory: {
    attributes: [
      { component: "TextBox", name: "name" },
      { component: "TextBox", name: "label" },
      { component: "TextArea", name: "description" },
    ],
    isInlineEditable: true,
    name: "CompCategory",
    title: "Component Category",
  },
  DataType: {
    attributes: [
      { component: "TextBox", name: "name" },
      { component: "TextBox", name: "label" },
      {
        collection: "g:'Comp'",
        component: "SelectBox",
        displayName: "Default Component",
    
          name: "default",
     
      },
    ],
    isInlineEditable: true,
    name: "DataType",
    title: "DataType",
  },
  FormCategory: {
    attributes: [
      { component: "TextBox", name: "name" },
      { component: "TextBox", name: "label" },
      { component: "TextArea", name: "description" },
    ],
    isInlineEditable: true,
    name: "FormCategory",
    title: "Form Category",
  },
  LogIn: {
    attributes: [
      { component: "TextBox", name: "email" },
      {
        component: "TextBox",
        mode: "password",
         name: "pass",
      },
    ],
    isRealTime: true,
    name: "User",
    title: "User",
  },
  Page: {
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
                const { formData } =
                  (options.validator.context as IFormContext) ||
                  ({} as IFormContext);
                const [graph, setGraph] = useGraph();
                const val = options.value;
                return !findVertexByLabelAndUniqueIdWithSkip(
                  "Page",
                  "id",
                  val,
                  formData.id,
                  graph,
                );
              },
            },
          ],
        
      },
      { component: "TextArea", name: "description" },
      {
        collection: "g:'Dashboard'",
        component: "TagBox",
        
          inward: true,
          name: "dashboard",
          parentLabel: "Dashboard",
        
      },
      { component: "CheckBox", name: "public" },
      /*{ component: "CheckBox", name: "isRealTime" },
      {
        collection: "g:'Form'",
        component: "SelectBox",
        displayName: "Collection",
        
          name: "coll",
          // inward: true,
          parentLabel: "Form",
        
      },
      {
        collection: `g:'{{->$0Coll::'P.name'}}'`,
        component: "SelectBox",
          name: "data",
      },*/
      {
        attributes: pageAttr,
        component: "DynamicTable",
        label: "Attr",
        
          name: "Attr",
          tab: "Attribute",
        
        type: "Attr",
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
        tab: "Permission",
      },
    ],
    name: "Page",
    title: "Page",
  },
  SignUp: {
    attributes: [
      { component: "TextBox", name: "email" },
      {
        component: "TextBox",
        mode: "password",
         name: "pass",
      },
    ],
    isRealTime: true,
    name: "User",
    title: "User",
  },
};
const rulesMetaAttribute = FormMetaData.Coll.attributes.find(
  (x) => x.name === "Rules"
);

FormMetaData.Form = {
  attributes: [...FormMetaData.Page.attributes, {
    collection: "g:'FormCategory'",
    component: "SelectBox",
    displayName: "Form Category",
    inward: true,
    name: "form",
    parentLabel: "FormCategory",
  }, rulesMetaAttribute!],
  name: "Form",
  title: "Form",
};
FormMetaData.ThankYouPage = {
  attributes: [...FormMetaData.Page.attributes],
  name: "ThankYouPage",
  title: "Thank You Page",
};
FormMetaData.ErrorPage = {
  attributes: [...FormMetaData.Page.attributes],
  name: "ErrorPage",
  title: "Error Page",
};
FormMetaData.TemplatePage = {
  attributes: [...FormMetaData.Page.attributes],
  name: "TemplatePage",
  title: "Templates",
};