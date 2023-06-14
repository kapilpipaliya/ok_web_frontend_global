import { FormMetaData, IFormContext } from "../lib/Record";
import { klona } from "klona";
import { findVertexByLabelAndUniqueId, findVertexByLabelAndUniqueIdWithSkip } from "../lib/Vertex";
import { useContext } from "solid-js";
import { IdAttr } from "../lib/graph";

/* use in c++
export const JSONToCypherMap = (json: object) => {
  // https://stackoverflow.com/questions/20841571/how-to-solve-the-dilemma-while-handle-json-in-neo4j-cypher
  return jju.stringify(json, { quote: "'" }).replace(/"/g, "\\x22");
};
*/

export const AttrsTableData: { [key: string]: FormMetaData } = {
  DataType: {
    title: "DataType",
    name: "DataType",
    attributes: [
      { name: "name", component: "TextBox" },
      {
        name: "default",
        displayName: "Default Component",
        component: "SelectBox",
        props: {
          
          collection: "Comp",
          skip: true,
        },
      },
    ],
  },
  Dashboard: {
    title: "Dashboards",
    name: "Dashboard",
    attributes: [
      { name: "name", component: "TextBox" },
      { name: "description", component: "TextArea" },
    ],
  },
  CompCategory: {
    title: "Component Category",
    name: "CompCategory",
    attributes: [
      { name: "name", component: "TextBox" },
      { name: "description", component: "TextArea" },
    ],
  },

  Comp: {
    title: "Component",
    name: "Comp",
    attributes: [
      {
        name: "category",
        component: "SelectBox",
        props: {
          
          collection: "CompCategory",
          parentLabel: "CompCategory",
          inward: true,
          skip: true,
        },
      },
      { name: "name", component: "TextBox" },
      { name: "description", component: "TextArea" },
      {
        name: "parent",
        displayName: "Parent Component",
        component: "SelectBox",
        props: {
          
          collection: "Comp",
          inward: true,
          parentLabel: "Comp",
          childLabel: "Child",
          skip: true,
        },
      },
      {
        name: "dataType",
        displayName: "DataType",
        component: "SelectBox",
        props: {
          
          collection: "DataType",
          inward: true,
          parentLabel: "DataType",
        },
      },
      {
        name: "Prop",
        component: "Table",
        tab: "Properties",
        attributes: [
          {
            name: "key",
            component: "TextBox",
          },

          {
            name: "dataType",
            component: "SelectBox",
            props: {
              
              collection: "DataType",
              onchange: '["Comp",null]',
            },
          },
          {
            name: "Comp",
            displayName: "Component",
            component: "SelectBox",
            props: {
              
              collection: "->$0DataType->$0Comp",
            },
          },
          // {
          //   // TODO: Be sure the name is ok, it will not change in production.
          //   name: "valueProp",
          //   displayName: "Value Property",
          //   component: "Table",
          //   tab: "Properties",
          //   attributes: [
          //     {
          //       name: "key",
          //       component: "SelectBox",
          //       props: {
          //         displayExpr: "P.key",
          //         collection: "-$0->$0Comp->$0Prop",
          //       },
          //     },
          //     {
          //       name: "value",
          //       meta: "->$0Key->$0Comp-CompChild->$0Prop+->$0Key->$0Comp->$0Prop",
          //       component: "->$0Key->$0Comp-CompChild:P.name||->$0Key->$0Comp:P[IdAttr]",
          //     },
          //   ],
          // },
          {
            name: "value",
            meta: "->$0Comp-CompChild->$0Prop+->$0Comp->$0Prop+->$0ValueProp",
            component:
              "->$0Comp-CompChild:P.name||->$0Comp:P.name||->$0DataType->$0Default:P.name",
            // component: "->$0Comp-CompChild:P.name||->$0Comp:P.name||->$0DataType->$0Default:P.name||defaultComp|->$0DataType:P.name",
          },
          {
            name: "reset",
            component: "Button",
            props: {
              function: "reset",
              onchange: '{"new": ["value","clear"], "edit": ["value","clear"]}',
            },
          },
          {
            name: "description",
            component: "TextArea",
            props: {
              // autoResizeEnabled: true,
              width: "550px",
            },
          },
        ],
      },
    ],
  },
  CollCategory: {
    title: "Collection Category",
    name: "CollCategory",
    attributes: [
      { name: "name", component: "TextBox" },
      { name: "description", component: "TextArea" },
    ],
  },

  // TODO: Coll has only one Attr. Add validation for that.
  Coll: {
    title: "Collection",
    name: "Coll",
    attributes: [
      {
        name: "title",
        component: "TextBox",
        props: {
          onchange: '{"new": ["name","id"]}',
        },
      },
      {
        name: "name",
        component: "TextBox",
        props: {
          validationRules: [
            {
              type: "required",
              message: "ID is required",
            },
            {
              type: "custom",
              ignoreEmptyValue: true,
              message: "This ID is already taken",
              validationCallback: (options) => {
                const { record } = options.validator.context || {} as IFormContext;

                const val = options.value;
                if (Object.keys(AttrsTableData).includes(val)) {
                  return false;
                } else {
                  return !findVertexByLabelAndUniqueIdWithSkip("Coll", "id", val, record.vertex.id);
                }
              },
            },
            // , {
            //   type: 'email',
            //   message: 'Email is invalid',
            // }
          ],
        },
      },
      // {
      //   name: "category",
      //   component: "SelectBox",
      //   props: {
      //     
      //     collection: "CollCategory",
      //     parentLabel: "CollCategory",
      //     inward: true,
      //     skip: true
      //   },
      // },
      {
        name: "dashboard",
        component: "TagBox",
        props: {
          
          collection: "Dashboard",
          parentLabel: "Dashboard",
          inward: true,
        },
      },
      { name: "description", component: "TextArea" },
      { name: "public", component: "CheckBox", props: { skip: true } },
      { name: "supportCustomFields", component: "CheckBox" },
      { name: "searchOnly", component: "CheckBox" },
      { name: "supportDeletedRecordSearch", component: "CheckBox" },
      {
        name: "pk",
        displayName: "Primary Key",
        component: "TagBox",
        props: {
          
          collection: "->$0Attr",
          // TODO: add validation
          // If there is not name attribute,
          // then this field is required.
        },
      },
      {
        name: "nameKey",
        component: "TagBox",
        props: {
          
          collection: "->$0Attr",
          // TODO: add validation
          // If there is not name attribute,
          // then this field is required.
        },
      },

      {
        name: "Attr",
        component: "Table",
        tab: "Attribute",
        props: {
          // unique: 'Attr',
          // kanban: true,
          // collection: "Attr",
        },
        attributes: [
          {
            name: "displayName",
            component: "TextBox",
            props: {
              onchange: '{"new": ["name","id"], "edit": ["name","id"]}',
            }
          },
          {
            name: "name",
            displayName: "ID",
            component: "TextBox",
            props: {},
          },
          {
            name: "definition",
            component: "TextArea",
          },
          {
            name: "tab",
            component: "SelectBox",
            props: {
              
              collection: "-CollAttr->$0Tab",
              skip: true,
            },
          },
          {
            name: "group",
            component: "SelectBox",
            props: {
              collection: "-CollAttr->$0Group",
              
              skip: true,
            },
          },
          {
            name: "dataType",
            component: "SelectBox",
            props: {
              
              collection: "DataType",
              // skip: true,
            },
          },
          {
            name: "Comp",
            component: "SelectBox",
            props: {
              
              collection: "->$0DataType->$0Comp",
              // smaller version:
              // collection: "Comp",
            },
          },

          // {
          //   name: "unique",
          //   component: "CheckBox",
          //   props: {
          //     skip: true,
          //   },
          // },
          {
            name: "required",
            component: "CheckBox",
            props: {
              skip: true,
            },
          },
          {
            name: "disabled",
            component: "CheckBox",
            props: {
              skip: true,
            },
          },
          {
            name: "Prop",
            displayName: "Properties",
            component: "Table",
            props: { skip: true },
            attributes: [
              {
                name: "key",
                component: "SelectBox",
                props: {
                  displayExpr: "P.key",
                  collection: "-$0->$0Comp->$0Prop",
                },
              },
              {
                name: "value",
                meta: "->$0Key->$0Comp-CompChild->$0Prop+->$0Key->$0Comp->$0Prop+->$0Key->$0ValueProp",
                component:
                  "->$0Key->$0Comp-CompChild:P.name||->$0Key->$0Comp:P.name||->$0Key->$0DataType->$0Default:P.name",
              },
            ],
          },
          {
            name: "Role",
            displayName: "Permissions",
            component: "Table",
            props: { skip: true },
            attributes: [
              {
                name: "role",
                component: "SelectBox",
                props: {
                  
                  collection: "Role",
                },
              },
              {
                name: "Perm",
                component: "Table",
                attributes: [
                  {
                    name: "perm",
                    component: "SelectBox",
                    props: {
                      
                      collection: "Perm",
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "Tab",
        component: "Table",
        tab: "Organize",
        props: { skip: true },
        attributes: [
          {
            name: "displayName",
            component: "TextBox",
            props: {
              onchange: '{"new": ["name","id"], "edit": ["name","id"]}',
            }
          },
          {
            name: "name",
            component: "TextBox",
          },
        ],
      },
      {
        name: "Group",
        component: "Table",
        tab: "Organize",
        props: { skip: true },
        attributes: [
          {
            name: "name",
            component: "TextBox",
          },
          {
            name: "name",
            component: "TextBox",
          },
        ],
      },
      {
        name: "Child",
        component: "Table",
        tab: "Child",
        props: { skip: true },
        attributes: [
          {
            name: "coll",
            component: "SelectBox",
            props: {
              
              collection: "Coll",
            },
          },
          {
            name: "displayName",
            component: "TextBox",
            props: {
              onchange: '{"new": ["name","id"], "edit": ["name","id"]}',
            }
          },
          {
            name: "name",
            component: "TextBox",
          },
          {
            name: "tab",
            component: "SelectBox",
            props: {
              
              collection: "-CollChild->$0Tab",
            },
          },
          {
            name: "group",
            component: "SelectBox",
            props: {
              collection: "-CollChild->$0Group",
              
            },
          },
          {
            name: "Prop",
            displayName: "Property",
            component: "Table",
            attributes: [
              {
                name: "key",
                component: "SelectBox",
                props: {
                  displayExpr: "P.key",
                  collection: "Comp[Table]->$0Prop",
                },
              },
              {
                name: "value",
                meta: "->$0Key->$0Comp-CompChild->$0Prop+->$0Key->$0Comp->$0Prop+->$0Key->$0ValueProp",
                component: "->$0Key->$0Comp-CompChild:P.name||->$0Key->$0Comp:P.name",
              },
            ],
          },
        ],
      },
      {
        name: "Transform",
        component: "Table",
        tab: "Transform",
        attributes: [
          {
            name: "coll",
            component: "SelectBox",
            props: {
              
              collection: "Coll",
            },
          },
          {
            name: "displayName",
            component: "TextBox",
          },
          {
            name: "fieldDefaults",
            component: "TextBox",
          },
          {
            name: "Prop",
            displayName: "Property",
            component: "Table",
            attributes: [
              {
                name: "key",
                component: "SelectBox",
                props: {
                  displayExpr: "P.key",
                  collection: "Comp[Table]->$0Prop",
                },
              },
              {
                name: "value",
                meta: "->$0Key->$0Comp-CompChild->$0Prop+->$0Key->$0Comp->$0Prop+->$0Key->$0ValueProp",
                component: "->$0Key->$0Comp-CompChild:P.name||->$0Key->$0Comp:P.name",
              },
            ],
          },
        ],
      },
      {
        name: "Role",
        component: "Table",
        tab: "Permission",
        props: { skip: true },
        attributes: [
          {
            name: "role",
            component: "SelectBox",
            props: {
              
              collection: "Role",
            },
          },
          {
            name: "perm",
            component: "TagBox",
            props: {
              
              collection: "Perm",
            },
          },
        ],
      },
      {
        name: "uniqueConstrain",
        component: "Table",
        tab: "Unique Constrain",
        attributes: [
          {
            name: "pk",
            displayName: "Unique Constrain Keys",
            component: "TagBox",
            props: {
              collection: "-$0->$0Attr",
            },
          },
        ],
      },
    ],
  },

  Form: {
    title: "Form",
    name: "Form",
    attributes: [
      { name: "name", component: "TextBox" },
      { name: "title", component: "TextBox" },
      { name: "description", component: "TextArea" },
      {
        name: "dashboard",
        component: "TagBox",
        props: {
          
          collection: "Dashboard",
          parentLabel: "Dashboard",
          inward: true,
        },
      },
      { name: "isRealTime", component: "CheckBox" },
      {
        name: "coll",
        displayName: "Collection",
        component: "SelectBox",
        props: {
          
          collection: "Coll",
          inward: true,
          parentLabel: "Coll",
        },
      },
      {
        name: "Attr",
        displayName: "Attribute",
        component: "Table",
        tab: "Attribute",
        attributes: [
          {
            name: "Attr",
            displayName: "Attribute",
            component: "SelectBox",
            props: {
              // displayExpr: "P.displayName||P.name",
              displayExpr: "$P.displayName ($P.name)",
              collection: "-$0-Coll$0->$0Attr",
            },
          },
          {
            name: "displayName",
            component: "TextBox",
            props: {
              // defaultValue: "->$0Attr:P.displayName",
            },
          },
          {
            name: "tab",
            component: "SelectBox",
            props: {
              collection: "-$0-Coll$0->$0Tab",
              
              defaultValue: "->$0Attr->$0Tab:P.name",
            },
          },
          {
            name: "group",
            component: "SelectBox",
            props: {
              collection: "-$0-Coll$0->$0Group",
              
              defaultValue: "->$0Attr->$0Group:P.name",
            },
          },
          {
            name: "dataType",
            component: "SelectBox",
            props: {
              collection: "DataType",
              
              hidden: true,
              // defaultValue: "->$0Attr->$0DataType:P.name",
              defaultValue: "->$0Attr->$0DataType:P.name",
            },
          },
          {
            name: "Comp",
            displayName: "Component",
            component: "SelectBox",
            props: {
              
              // collection: "->$0Attr->$0DataType->$0Comp",
              collection: "->$0Attr->$0DataType->$0Comp",
              defaultValue: "->$0Attr->$0Comp:P.name",
            },
          },
          {
            name: "required",
            component: "CheckBox",
            props: {
              defaultValue: "->$0Attr:P.required",
            },
          },
          {
            name: "disabled",
            component: "CheckBox",
            props: {
              defaultValue: "->$0Attr:P.disabled",
            },
          },
          {
            name: "Prop",
            displayName: "Property",
            component: "Table",
            attributes: [
              {
                name: "key",
                component: "SelectBox",
                props: {
                  displayExpr: "P.key",
                  collection: "-$0->$0Comp->$0Prop||-$0->$0Attr->$0Comp->$0Prop",
                },
              },
              {
                name: "value",
                meta: "->$0Key->$0Comp-CompChild->$0Prop+->$0Key->$0Comp->$0Prop+->$0Key->$0ValueProp",
                component: "->$0Key->$0Comp-CompChild:P.name||->$0Key->$0Comp:P.name",
              },
            ],
          },
        ],
      },
      {
        name: "Child",
        displayName: "Children",
        component: "Table",
        tab: "Children",
        attributes: [
          {
            name: "Coll",
            displayName: "Collection",
            component: "SelectBox",
            props: {
              displayExpr: "->$0Coll:P.name",
              collection: "-$0-Coll$0->$0Child",
            },
          },
          {
            name: "tab",
            component: "SelectBox",
            props: {
              collection: "-$0-Coll$0->$0Tab",
              
              defaultValue: "->$0Coll->$0Tab:P.name",
            },
          },
          {
            name: "group",
            component: "SelectBox",
            props: {
              collection: "-$0-Coll$0->$0Group",
              
              defaultValue: "->$0Coll->$0Group:P.name",
            },
          },
          {
            name: "Attr",
            displayName: "Attribute",
            component: "Table",
            attributes: [
              {
                name: "Attr",
                displayName: "Attribute",
                component: "SelectBox",
                props: {
                  displayExpr: "P.name",
                  collection: "-$0->$0Coll->$0Coll->$0Attr",
                },
              },
              {
                name: "dataType",
                component: "SelectBox",
                props: {
                  collection: "DataType",
                  
                  hidden: true,
                  defaultValue: "->$0Attr->$0DataType:P.name",
                },
              },
              {
                name: "Comp",
                displayName: "Component",
                component: "SelectBox",
                props: {
                  
                  collection: "->$0Attr->$0DataType->$0Comp",
                  defaultValue: "->$0Attr->$0Comp:P.name",
                },
              },
              {
                name: "displayName",
                component: "TextBox",
                props: {
                  defaultValue: "->$0Attr:P.displayName",
                },
              },
              {
                name: "required",
                component: "CheckBox",
                props: {
                  defaultValue: "->$0Attr:P.required",
                },
              },
              {
                name: "disabled",
                component: "CheckBox",
                props: {
                  defaultValue: "->$0Attr:P.disabled",
                },
              },
              {
                name: "child",
                component: "SelectBox",
                props: {
                  
                  collection: "Form",
                },
              },
              {
                name: "Prop",
                component: "Table",
                attributes: [
                  {
                    name: "key",
                    component: "SelectBox",
                    props: {
                      displayExpr: "P.key",
                      collection: "-$0->$0Comp->$0Prop||-$0->$0Attr->$0Comp->$0Prop",
                    },
                  },
                  {
                    name: "value",
                    meta: "->$0Key->$0Comp-CompChild->$0Prop+->$0Key->$0Comp->$0Prop+->$0Key->$0ValueProp",
                    component: "->$0Key->$0Comp-CompChild:P.name||->$0Key->$0Comp:P.name",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  User: {
    title: "User",
    name: "User",
    attributes: [
      { name: "name", component: "TextBox" },
      { name: "email", component: "TextBox" },
      { name: "pass", component: "TextBox" },
      {
        name: "role",
        component: "TagBox",
        props: {
          
          collection: "Role",
        },
      },
    ],
  },
  Perm: {
    title: "Perm",
    name: "Perm",
    attributes: [{ name: "name", component: "TextBox" }],
  },
  Role: {
    title: "Role",
    name: "Role",
    attributes: [{ name: "name", component: "TextBox" }],
  },
  Import: {
    title: "Simple Insert",
    name: "Import",
    isRealTime: true,
    attributes: [
      {
        name: "csv",
        component: "TextArea",
        props: { width: 600, height: 500 },
      },
      { name: "label", component: "TextBox" },
      { name: "dry", component: "CheckBox" },
      { name: "lookup", component: "TextBox" },
      { name: "lookupId", component: "TextBox" },
      { name: "lookupChild", component: "TextBox" },
      {
        name: "meta",
        component: "Table",
        attributes: [
          { name: "column", component: "TextBox" },
          // {
          //  name: "column",
          //  component: "SelectBox",
          //  props: {
          //   displayExpr: "key",
          //   collection: "Update Dynamically on meta based on first row",
          //  },
          // },
          { name: "attrId", displayName: "Attribute ID", component: "TextBox" },
          {
            name: "coll",
            displayName: "Lookup Collection",
            component: "SelectBox",
            props: {
              displayExpr: "key",
              collection: "Coll",
            },
          },
          { name: "collLabel", displayName: "Lookup Label", component: "TextBox" },
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
            props: {
              stringValue: true,
              displayExpr: "key",
              collection: '[{"key":"dataType","id":"dataType"}, {"id": "lookup", "key": "lookup"}]',
            },
          },
          { name: "skip", component: "CheckBox" },
          { name: "skipRow", component: "TextArea" },
        ],
      },
    ],
  },
  SignUp: {
    title: "User",
    name: "User",
    isRealTime: true,
    attributes: [
      { name: "email", component: "TextBox" },
      {
        name: "pass",
        component: "TextBox",
        props: { mode: "password" },
      },
    ],
  },
  LogIn: {
    title: "User",
    name: "User",
    isRealTime: true,
    attributes: [
      { name: "email", component: "TextBox" },
      {
        name: "pass",
        component: "TextBox",
        props: { mode: "password" },
      },
    ],
  },
  _PageData: {
    title: "User",
    name: "User",
    isRealTime: true,
    attributes: [
      {
        name: "coll",
        component: "SelectBox",
        props: {
          
          collection: "Coll",
        },
      },
      {
        name: "data",
        component: "SelectBox",
        props: {
          
          collection: `{->$0Coll:P.${IdAttr}}`,
        },
      },
    ],
  },
  Page2: {
    title: "Page2",
    name: "Page2",
    attributes: [
      {
        name: "title",
        component: "TextBox",
        props: {
          onchange: '{"new": ["name","id"]}',
        },
      },
      {
        name: "name",
        component: "TextBox",
        props: {
          validationRules: [
            {
              type: "required",
              message: "ID is required",
            },
            {
              type: "custom",
              ignoreEmptyValue: true,
              message: "This ID is already taken",
              validationCallback: (options) => {
                const { record } = options.validator.context || {} as IFormContext;

                const val = options.value;
                return !findVertexByLabelAndUniqueIdWithSkip("Page2", "id", val, record.vertex.id);
              },
            },
          ],
        },
      },
      { name: "description", component: "TextArea" },
      { name: "public", component: "CheckBox", props: { skip: true } },
      {
        name: "Attr",
        component: "Table",
        tab: "Attribute",
        props: {
          // unique: 'Attr',
          // kanban: true,
          // collection: "Attr",
        },
        attributes: [
          {
            name: "name",
            displayName: "ID",
            component: "TextBox",
            props: {},
          },
          {
            name: "definition",
            component: "TextArea",
          },
          // {
          //   name: "parent",
          //   component: "SelectBox",
          //   props: {
          //     
          //     collection: "-$0->$0Attr",
          //     focusRefresh: true
          //   },
          // },
          {
            name: "Comp",
            component: "SelectBox",
            props: {
              
              collection: "Comp",
              // smaller version:
              // collection: "Comp",
            },
          },
          {
            name: "Prop",
            displayName: "Property",
            component: "Table",
            props: { skip: true },
            attributes: [
              {
                name: "key",
                component: "SelectBox",
                props: {
                  displayExpr: "P.key",
                  collection: "-$0->$0Comp->$0Prop",
                },
              },
              {
                name: "value",
                meta: "->$0Key->$0Comp-CompChild->$0Prop+->$0Key->$0Comp->$0Prop+->$0Key->$0ValueProp",
                component:
                 "->$0Key->$0Comp-CompChild:P.name||->$0Key->$0Comp:P.name||->$0Key->$0DataType->$0Default:P.name",
              },
            ],
          },
          {
            name: "Role",
            component: "Table",
            props: { skip: true },
            attributes: [
              {
                name: "role",
                component: "SelectBox",
                props: {
                  
                  collection: "Role",
                },
              },
              {
                name: "Perm",
                component: "Table",
                attributes: [
                  {
                    name: "perm",
                    component: "SelectBox",
                    props: {
                      
                      collection: "Perm",
                    },
                  },
                ],
              },
            ],
          },
          {
            name: "Attr",
            component: "Table",
            tab: "expand",
            props: {
              // unique: 'Attr',
              // kanban: true,
              // collection: "Attr",
            },
            attributes: [
              {
                name: "name",
                displayName: "ID",
                component: "TextBox",
                props: {},
              },
              {
                name: "Comp",
                component: "SelectBox",
                props: {
                  
                  collection: "Comp",
                  // smaller version:
                  // collection: "Comp",
                },
              },
              {
                name: "Prop",
                displayName: "Property",
                component: "Table",
                attributes: [
                  {
                    name: "key",
                    component: "SelectBox",
                    props: {
                      displayExpr: "P.key",
                      collection: "-$0->$0Comp->$0Prop",
                    },
                  },
                  {
                    name: "value",
                    meta: "->$0Key->$0Comp-CompChild->$0Prop+->$0Key->$0Comp->$0Prop+->$0Key->$0ValueProp",
                    component:
                     "->$0Key->$0Comp-CompChild:P.name||->$0Key->$0Comp:P.name||->$0Key->$0DataType->$0Default:P.name",
                  },
                ],
              },
              {
                name: "Attr",
                component: "Table",
                tab: "expand",
                props: {
                  // unique: 'Attr',
                  // kanban: true,
                  // collection: "Attr",
                },
                attributes: [
                  {
                    name: "name",
                    displayName: "ID",
                    component: "TextBox",
                    props: {},
                  },
                  {
                    name: "Comp",
                    component: "SelectBox",
                    props: {
                      
                      collection: "Comp",
                      // smaller version:
                      // collection: "Comp",
                    },
                  },
                  {
                    name: "Prop",
                    displayName: "Property",
                    component: "Table",
                    attributes: [
                      {
                        name: "key",
                        component: "SelectBox",
                        props: {
                          displayExpr: "P.key",
                          collection: "-$0->$0Comp->$0Prop",
                        },
                      },
                      {
                        name: "value",
                        meta: "->$0Key->$0Comp-CompChild->$0Prop+->$0Key->$0Comp->$0Prop+->$0Key->$0ValueProp",
                        component:
                         "->$0Key->$0Comp-CompChild:P.name||->$0Key->$0Comp:P.name||->$0Key->$0DataType->$0Default:P.name",
                      },
                    ],
                  },
                  {
                    name: "Attr",
                    component: "Table",
                    tab: "expand",
                    props: {
                      // unique: 'Attr',
                      // kanban: true,
                      // collection: "Attr",
                    },
                    attributes: [
                      {
                        name: "name",
                        displayName: "ID",
                        component: "TextBox",
                        props: {},
                      },
                      {
                        name: "Comp",
                        component: "SelectBox",
                        props: {
                          
                          collection: "Comp",
                          // smaller version:
                          // collection: "Comp",
                        },
                      },
                      {
                        name: "Prop",
                        displayName: "Property",
                        component: "Table",
                        attributes: [
                          {
                            name: "key",
                            component: "SelectBox",
                            props: {
                              displayExpr: "P.key",
                              collection: "-$0->$0Comp->$0Prop",
                            },
                          },
                          {
                            name: "value",
                            meta: "->$0Key->$0Comp-CompChild->$0Prop+->$0Key->$0Comp->$0Prop+->$0Key->$0ValueProp",
                            component:
                             "->$0Key->$0Comp-CompChild:P.name||->$0Key->$0Comp:P.name||->$0Key->$0DataType->$0Default:P.name",
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
      {
        name: "Role",
        component: "Table",
        tab: "Permission",
        props: { skip: true },
        attributes: [
          {
            name: "role",
            component: "SelectBox",
            props: {
              
              collection: "Role",
            },
          },
          {
            name: "Perm",
            component: "Table",
            attributes: [
              {
                name: "perm",
                component: "SelectBox",
                props: {
                  
                  collection: "Perm",
                },
              },
            ],
          },
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
        props: {
          onchange: '{"new": ["name","id"]}',
        },
      },
      {
        name: "name",
        component: "TextBox",
        props: {
          validationRules: [
            {
              type: "required",
              message: "ID is required",
            },
            {
              type: "custom",
              ignoreEmptyValue: true,
              message: "This ID is already taken",
              validationCallback: (options) => {
                const { record } = options.validator.context || {} as IFormContext;

                const val = options.value;
                return !findVertexByLabelAndUniqueIdWithSkip("Navigation", "id", val, record.vertex.id);
              },
            },
          ],
        },
      },
      { name: "description", component: "TextArea" },
      {
        name: "Attr",
        component: "Table",
        tab: "Attributes",
        props: {
          type: "NavAttr"
        },
        attributes: [
          {
            name: "name",
            displayName: "ID",
            component: "TextBox",
            props: {},
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
            props: {
              
              items: `Table
Form
Url`,
            },
          },
          {
            name: "Coll",
            component: "SelectBox",
            props: {
              
              collection: "Coll",
            },
          },
          {
            name: "Form",
            component: "SelectBox",
            props: {
              
              collection: "Form",
            },
          },
          {
            name: "url",
            component: "TextBox",
          },
          {
            name: "Role",
            component: "Table",
            tab: "Permission",
            attributes: [
              {
                name: "role",
                component: "SelectBox",
                props: {
                  collection: "Role",
                },
              },
              {
                name: "Perm",
                component: "Table",
                attributes: [
                  {
                    name: "perm",
                    component: "SelectBox",
                    props: {
                      collection: "Perm",
                    },
                  },
                ],
              },
            ],
          },
          {
            name: "Attr",
            component: "Table",
            tab: "expand",
            props: {
              type: "NavAttr"
            },
            attributes: [
              {
                name: "name",
                displayName: "ID",
                component: "TextBox",
                props: {},
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
                props: {
                  
                  items: `Table
Form
Url`,
                },
              },
              {
                name: "Coll",
                component: "SelectBox",
                props: {
                  
                  collection: "Coll",
                },
              },
              {
                name: "Form",
                component: "SelectBox",
                props: {
                  
                  collection: "Form",
                },
              },
              {
                name: "url",
                component: "TextBox",
              },
              {
                name: "Role",
                component: "Table",
                tab: "Permission",
                attributes: [
                  {
                    name: "role",
                    component: "SelectBox",
                    props: {
                      collection: "Role",
                    },
                  },
                  {
                    name: "Perm",
                    component: "Table",
                    attributes: [
                      {
                        name: "perm",
                        component: "SelectBox",
                        props: {
                          collection: "Perm",
                        },
                      },
                    ],
                  },
                ],
              },
              {
                name: "Attr",
                component: "Table",
                tab: "expand",
                props: {
                  type: "NavAttr"
                },
                attributes: [
                  {
                    name: "name",
                    displayName: "ID",
                    component: "TextBox",
                    props: {},
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
                    props: {
                      
                      items: `Table
Form
Url`,
                    },
                  },
                  {
                    name: "Coll",
                    component: "SelectBox",
                    props: {
                      
                      collection: "Coll",
                    },
                  },
                  {
                    name: "Form",
                    component: "SelectBox",
                    props: {
                      
                      collection: "Form",
                    },
                  },
                  {
                    name: "url",
                    component: "TextBox",
                  },
                  {
                    name: "Role",
                    component: "Table",
                    tab: "Permission",
                    attributes: [
                      {
                        name: "role",
                        component: "SelectBox",
                        props: {
                          collection: "Role",
                        },
                      },
                      {
                        name: "Perm",
                        component: "Table",
                        attributes: [
                          {
                            name: "perm",
                            component: "SelectBox",
                            props: {
                              collection: "Perm",
                            },
                          },
                        ],
                      },
                    ],
                  },
                  {
                    name: "Attr",
                    component: "Table",
                    tab: "expand",
                    props: {
                      type: "NavAttr"
                    },
                    attributes: [
                      {
                        name: "name",
                        displayName: "ID",
                        component: "TextBox",
                        props: {},
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
                        props: {
                          
                          items: `Table
Form
Url`,
                        },
                      },
                      {
                        name: "Coll",
                        component: "SelectBox",
                        props: {
                          
                          collection: "Coll",
                        },
                      },
                      {
                        name: "Form",
                        component: "SelectBox",
                        props: {
                          
                          collection: "Form",
                        },
                      },
                      {
                        name: "url",
                        component: "TextBox",
                      },
                      {
                        name: "Role",
                        component: "Table",
                        tab: "Permission",
                        attributes: [
                          {
                            name: "role",
                            component: "SelectBox",
                            props: {
                              collection: "Role",
                            },
                          },
                          {
                            name: "Perm",
                            component: "Table",
                            attributes: [
                              {
                                name: "perm",
                                component: "SelectBox",
                                props: {
                                  collection: "Perm",
                                },
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
const PageMetaData = klona(AttrsTableData.Form);
PageMetaData.title = "Page";
PageMetaData.name = "Page";
PageMetaData.attributes = PageMetaData.attributes.filter((attr) => !["table"].includes(attr.name));
AttrsTableData.Page = klona(PageMetaData);
// window.a = AttrsTableData;
