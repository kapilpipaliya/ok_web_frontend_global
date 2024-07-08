

import type { IFormMetaData } from "~/lib/FormMetadataType";
import type { IFormContext } from "~/lib/contexts";

import { findVertexByLabelAndUniqueIdWithSkip } from "~/lib/graph/get/sync/findVertex";

import { useGraph } from "./graph/graph";

export const FormMetaDataAuth: { [key: string]: IFormMetaData } = {
  Dashboard: {
    attributes: [
      { component: "TextBox", name: "name" },
      { component: "TextArea", name: "description" },
    ],
    isInlineEditable: true,
    name: "Dashboard",
    title: "Dashboards",
  },
  Import: {
    attributes: [
      {
        component: "TextArea",
        height: 500,
         name: "csv", width: 600,
      },
      { component: "TextBox", name: "label" },
      { component: "CheckBox", name: "dry" },
      { component: "TextBox", name: "lookup" },
      { component: "TextBox", name: "lookupId" },
      { component: "TextBox", name: "lookupChild" },
      {
        attributes: [
          { component: "TextBox", name: "column" },
          // {
          //  name: "column",
          //  component: "SelectBox",
          //  
          //   displayExpr: "key",
          //   collection: "Update Dynamically on meta based on first row",
          //  },
          // },
          { component: "TextBox", displayName: "Attribute ID", name: "attrId" },
          {
            collection: "g:'Form'",
            component: "SelectBox",
            displayExpr: "name",
            
              displayName: "Lookup Collection",
              name: "coll",
            
          },
          {
            component: "TextBox",
            displayName: "Lookup Label",
            name: "collLabel",
          },
          { component: "CheckBox", name: "inward" },
          {
            component: "TextBox",
            displayName: "Lookup Collection ID",
            name: "collId",
          },
          { component: "TextBox", displayName: "Edge Type", name: "edge" },
          {
            collection:
                '[{"key":"dataType","id":"dataType"}, {"id": "lookup", "key": "lookup"}]',
            component: "SelectBox",
            displayExpr: "key",
            
              displayName: "Function",
              name: "func",
              stringValue: true,
            
          },
          { component: "CheckBox", name: "skip" },
          { component: "TextArea", name: "skipRow" },
        ],
        component: "DynamicTable",
        name: "meta",
      },
    ],
    isRealTime: true,
    name: "Import",
    title: "Simple Insert",
  },
  Nav: {
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
      { component: "TextArea", name: "description" },
      {
        attributes: [
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
            component: "CheckBox",
            name: "expanded",
          },
          {
            component: "SelectBox",
            items: `Table
Form
Url`,
            
              name: "func",
            
          },
          {
            collection: "g:'Form'",
            component: "SelectBox",
            
              name: "Form",
            
          },
          {
            component: "TextBox",
            name: "url",
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
          {
            attributes: [
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
                component: "CheckBox",
                name: "expanded",
              },
              {
                component: "SelectBox",
                items: `Table
Form
Url`,
                
                  name: "func",

              },
              {
                collection: "g:'Form'",
                component: "SelectBox",
                
                  name: "Form",
                
              },
              {
                component: "TextBox",
                name: "url",
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
              {
                attributes: [
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
                    component: "CheckBox",
                    name: "expanded",
                  },
                  {
                    component: "SelectBox",
                    items: `Table
Form
Url`,
                    
                      name: "func",
                    
                  },
                  {
                    collection: "g:'Form'",
                    component: "SelectBox",
                    
                      name: "Form",
                    
                  },
                  {
                    component: "TextBox",
                    name: "url",
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
                  {
                    attributes: [
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
                        component: "CheckBox",
                        name: "expanded",
                      },
                      {
                        component: "SelectBox",
                        items: `Table
Form
Url`,
                        
                          name: "func",
                        
                      },
                      {
                        collection: "g:'Form'",
                        component: "SelectBox",
                        
                          name: "Form",
                        
                      },
                      {
                        component: "TextBox",
                        name: "url",
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
                    component: "DynamicTable",
                    name: "Attr",
                    
                      tab: "expand",
                    
                    type: "NavAttr",
                  },
                ],
                component: "DynamicTable",
                name: "Attr",
                
                  tab: "expand",
                
                type: "NavAttr",
              },
            ],
            component: "DynamicTable",
            name: "Attr",
            
              tab: "expand",
 
            type: "NavAttr",
          },
        ],
        component: "DynamicTable",
        name: "Attr",
        
          tab: "Attributes",
        
        type: "NavAttr",
      },
    ],
    name: "Nav",
    title: "Navigation",
  },
  Perm: {
    attributes: [{ component: "TextBox", name: "name" }],
    isInlineEditable: true,
    name: "Perm",
    title: "Perm",
  },
  Role: {
    attributes: [{ component: "TextBox", name: "name" }],
    isInlineEditable: true,
    name: "Role",
    title: "Role",
  },
  User: {
    attributes: [
      { component: "TextBox", name: "name" },
      { component: "TextBox", name: "email" },
      { component: "TextBox", name: "pass" },
      {
        collection: "g:'Role'",
        component: "TagBox",
        
          name: "role",
        
      },
    ],
    isInlineEditable: true,
    name: "User",
    title: "User",
  },
  // TODO: Dynamic Filter on Grid: Role->Filter
};
