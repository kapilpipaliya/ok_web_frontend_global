import { findVertexByLabelAndUniqueIdWithSkip } from "~/lib/graph/get/sync/findVertex";

import type { IFormMetaData } from "~/lib/FormMetadataType";
import { GraphContext } from "~/lib/graph/graph";
import { useContext } from "solid-js";
import type { IFormContext } from "~/lib/contexts";

export const FormMetaDataAuth: { [key: string]: IFormMetaData } = {
  User: {
    title: "User",
    name: "User",
    isInlineEditable: true,
    attributes: [
      { name: "name", component: "TextBox" },
      { name: "email", component: "TextBox" },
      { name: "pass", component: "TextBox" },
      {
        name: "role",
        component: "TagBox",
        
          collection: "g:'Role'",
        
      },
    ],
  },
  Perm: {
    title: "Perm",
    name: "Perm",
    isInlineEditable: true,
    attributes: [{ name: "name", component: "TextBox" }],
  },
  Role: {
    title: "Role",
    name: "Role",
    isInlineEditable: true,
    attributes: [{ name: "name", component: "TextBox" }],
  },
  Dashboard: {
    title: "Dashboards",
    name: "Dashboard",
    isInlineEditable: true,
    attributes: [
      { name: "name", component: "TextBox" },
      { name: "description", component: "TextArea" },
    ],
  },
  Import: {
    title: "Simple Insert",
    name: "Import",
    isRealTime: true,
    attributes: [
      {
        name: "csv",
        component: "TextArea",
         width: 600, height: 500,
      },
      { name: "label", component: "TextBox" },
      { name: "dry", component: "CheckBox" },
      { name: "lookup", component: "TextBox" },
      { name: "lookupId", component: "TextBox" },
      { name: "lookupChild", component: "TextBox" },
      {
        name: "meta",
        component: "DynamicTable",
        attributes: [
          { name: "column", component: "TextBox" },
          // {
          //  name: "column",
          //  component: "SelectBox",
          //  
          //   displayExpr: "key",
          //   collection: "Update Dynamically on meta based on first row",
          //  },
          // },
          { name: "attrId", displayName: "Attribute ID", component: "TextBox" },
          {
            name: "coll",
            displayName: "Lookup Collection",
            component: "SelectBox",
            
              displayExpr: "name",
              collection: "g:'Coll'",
            
          },
          {
            name: "collLabel",
            displayName: "Lookup Label",
            component: "TextBox",
          },
          { name: "inward", component: "CheckBox" },
          {
            name: "collId",
            displayName: "Lookup Collection ID",
            component: "TextBox",
          },
          { name: "edge", displayName: "Edge Type", component: "TextBox" },
          {
            name: "func",
            displayName: "Function",
            component: "SelectBox",
            
              stringValue: true,
              displayExpr: "key",
              collection:
                '[{"key":"dataType","id":"dataType"}, {"id": "lookup", "key": "lookup"}]',
            
          },
          { name: "skip", component: "CheckBox" },
          { name: "skipRow", component: "TextArea" },
        ],
      },
    ],
  },
  Nav: {
    title: "Navigation",
    name: "Nav",
    attributes: [
      {
        name: "title",
        component: "TextBox",
        
          onchange: '{"new": ["name","id"]}',
        
      },
      {
        name: "name",
        component: "TextBox",
        
          validationRules: [
            {
              type: "required",
              message: "ID is required",
            },
            {
              type: "custom",
              ignoreEmptyValue: true,
              message: "This ID is already taken",
              validationCallback: (options: any) => {
                const { formData } =
                  (options.validator.context as IFormContext) ||
                  ({} as IFormContext);
                const [graph, setGraph] = useContext(GraphContext)!;

                const val = options.value;
                return !findVertexByLabelAndUniqueIdWithSkip(
                  "Navigation",
                  "id",
                  val,
                  formData.id,
                  graph,
                );
              },
            },
          ],
        
      },
      { name: "description", component: "TextArea" },
      {
        name: "Attr",
        component: "DynamicTable",
        tab: "Attributes",
        
          type: "NavAttr",
        
        attributes: [
          {
            name: "name",
            displayName: "ID",
            component: "TextBox",

          },
          {
            name: "definition",
            component: "TextArea",
          },
          {
            name: "expanded",
            component: "CheckBox",
          },
          {
            name: "func",
            component: "SelectBox",
            
              items: `Table
Form
Url`,
            
          },
          {
            name: "Coll",
            component: "SelectBox",
            
              collection: "g:'Coll'",
            
          },
          {
            name: "Form",
            component: "SelectBox",
            
              collection: "g:'Form'",
            
          },
          {
            name: "url",
            component: "TextBox",
          },
          {
            name: "Role",
            component: "DynamicTable",
            tab: "Permission",
            attributes: [
              {
                name: "role",
                component: "SelectBox",
                
                  collection: "g:'Role'",
                
              },
              {
                name: "Perm",
                component: "DynamicTable",
                attributes: [
                  {
                    name: "perm",
                    component: "SelectBox",
                    
                      collection: "g:'Perm'",
                    
                  },
                ],
              },
            ],
          },
          {
            name: "Attr",
            component: "DynamicTable",
            tab: "expand",
            
              type: "NavAttr",
 
            attributes: [
              {
                name: "name",
                displayName: "ID",
                component: "TextBox",
                
              },
              {
                name: "definition",
                component: "TextArea",
              },
              {
                name: "expanded",
                component: "CheckBox",
              },
              {
                name: "func",
                component: "SelectBox",
                
                  items: `Table
Form
Url`,

              },
              {
                name: "Coll",
                component: "SelectBox",
                
                  collection: "g:'Coll'",
          
              },
              {
                name: "Form",
                component: "SelectBox",
                
                  collection: "g:'Form'",
                
              },
              {
                name: "url",
                component: "TextBox",
              },
              {
                name: "Role",
                component: "DynamicTable",
                tab: "Permission",
                attributes: [
                  {
                    name: "role",
                    component: "SelectBox",
                    
                      collection: "g:'Role'",
                    
                  },
                  {
                    name: "Perm",
                    component: "DynamicTable",
                    attributes: [
                      {
                        name: "perm",
                        component: "SelectBox",
                        
                          collection: "g:'Perm'",
                        
                      },
                    ],
                  },
                ],
              },
              {
                name: "Attr",
                component: "DynamicTable",
                tab: "expand",
                
                  type: "NavAttr",
                
                attributes: [
                  {
                    name: "name",
                    displayName: "ID",
                    component: "TextBox",
                    
                  },
                  {
                    name: "definition",
                    component: "TextArea",
                  },
                  {
                    name: "expanded",
                    component: "CheckBox",
                  },
                  {
                    name: "func",
                    component: "SelectBox",
                    
                      items: `Table
Form
Url`,
                    
                  },
                  {
                    name: "Coll",
                    component: "SelectBox",
                    
                      collection: "g:'Coll'",
                    
                  },
                  {
                    name: "Form",
                    component: "SelectBox",
                    
                      collection: "g:'Form'",
                    
                  },
                  {
                    name: "url",
                    component: "TextBox",
                  },
                  {
                    name: "Role",
                    component: "DynamicTable",
                    tab: "Permission",
                    attributes: [
                      {
                        name: "role",
                        component: "SelectBox",
                        
                          collection: "g:'Role'",
                        
                      },
                      {
                        name: "Perm",
                        component: "DynamicTable",
                        attributes: [
                          {
                            name: "perm",
                            component: "SelectBox",
                            
                              collection: "g:'Perm'",
                            
                          },
                        ],
                      },
                    ],
                  },
                  {
                    name: "Attr",
                    component: "DynamicTable",
                    tab: "expand",
                    
                      type: "NavAttr",
                    
                    attributes: [
                      {
                        name: "name",
                        displayName: "ID",
                        component: "TextBox",
                 
                      },
                      {
                        name: "definition",
                        component: "TextArea",
                      },
                      {
                        name: "expanded",
                        component: "CheckBox",
                      },
                      {
                        name: "func",
                        component: "SelectBox",
                        
                          items: `Table
Form
Url`,
                        
                      },
                      {
                        name: "Coll",
                        component: "SelectBox",
                        
                          collection: "g:'Coll'",
                        
                      },
                      {
                        name: "Form",
                        component: "SelectBox",
                        
                          collection: "g:'Form'",
                        
                      },
                      {
                        name: "url",
                        component: "TextBox",
                      },
                      {
                        name: "Role",
                        component: "DynamicTable",
                        tab: "Permission",
                        attributes: [
                          {
                            name: "role",
                            component: "SelectBox",
                            
                              collection: "g:'Role'",
                            
                          },
                          {
                            name: "Perm",
                            component: "DynamicTable",
                            attributes: [
                              {
                                name: "perm",
                                component: "SelectBox",
                                
                                  collection: "g:'Perm'",
                                
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  // TODO: Dynamic Filter on Grid: Role->Filter
};
