import { FormMetaData } from "./Form";
import { klona } from "klona";
import { findVertexByLabelAndUniqueId, findVertexByLabelAndUniqueIdWithSkip } from "../lib/Vertex";
import { useContext } from "solid-js";
import { FormContext } from "./dynamicForm";
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
          displayExpr: `properties.${IdAttr}`,
          collection: "Comp",
          skip: true,
        },
      },
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
          displayExpr: `properties.${IdAttr}`,
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
          displayExpr: `properties.${IdAttr}`,
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
          displayExpr: `properties.${IdAttr}`,
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
              displayExpr: `properties.${IdAttr}`,
              collection: "DataType",
              onchange: '["Comp",null]',
            },
          },
          {
            name: "Comp",
            displayName: "Component",
            component: "SelectBox",
            props: {
              displayExpr: `properties.${IdAttr}`,
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
          //         displayExpr: "properties.key",
          //         collection: "-$0->$0Comp->$0Prop",
          //       },
          //     },
          //     {
          //       name: "value",
          //       meta: "->$0Key->$0Comp-CompChild->$0Prop+->$0Key->$0Comp->$0Prop",
          //       component: "->$0Key->$0Comp-CompChild:properties.name||->$0Key->$0Comp:properties[IdAttr]",
          //     },
          //   ],
          // },
          {
            name: "value",
            meta: "->$0Comp-CompChild->$0Prop+->$0Comp->$0Prop+->$0ValueProp",
            component:
              "->$0Comp-CompChild:properties.name||->$0Comp:properties.name||->$0DataType->$0Default:properties.name",
            // component: "->$0Comp-CompChild:properties.name||->$0Comp:properties.name||->$0DataType->$0Default:properties.name||defaultComp|->$0DataType:properties.name",
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
                const { local, cleanUpConfig, formVertex } = options.validator.context || {};

                const val = options.value;
                if (Object.keys(AttrsTableData).includes(val)) {
                  return false;
                } else {
                  return !findVertexByLabelAndUniqueIdWithSkip("Coll", "id", val, formVertex?.id);
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
      //     displayExpr: `properties.${IdAttr}`,
      //     collection: "CollCategory",
      //     parentLabel: "CollCategory",
      //     inward: true,
      //     skip: true
      //   },
      // },
      { name: "description", component: "TextArea" },
      { name: "table", component: "CheckBox" },
      { name: "public", component: "CheckBox", props: { skip: true } },
      {
        name: "Tab",
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
              displayExpr: `properties.${IdAttr}`,
              collection: "-CollAttr->$0Tab",
              skip: true,
            },
          },
          {
            name: "group",
            component: "SelectBox",
            props: {
              collection: "-CollAttr->$0Group",
              displayExpr: `properties.${IdAttr}`,
              skip: true,
            },
          },
          {
            name: "dataType",
            component: "SelectBox",
            props: {
              displayExpr: `properties.${IdAttr}`,
              collection: "DataType",
              skip: true,
            },
          },
          {
            name: "Comp",
            component: "SelectBox",
            props: {
              displayExpr: `properties.${IdAttr}`,
              collection: "->$0DataType->$0Comp",
              // smaller version:
              // collection: "Comp",
            },
          },

          {
            name: "unique",
            component: "CheckBox",
            props: {
              skip: true,
            },
          },
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
            displayName: "Property",
            component: "Table",
            props: { skip: true },
            attributes: [
              {
                name: "key",
                component: "SelectBox",
                props: {
                  displayExpr: "properties.key",
                  collection: "-CollAttrProp->CollAttrComp->$0Prop||-CollAttrProp->$0Attr->$0Comp->$0Prop",
                },
              },
              {
                name: "value",
                meta: "->$0Key->$0Comp-CompChild->$0Prop+->$0Key->$0Comp->$0Prop+->$0Key->$0ValueProp",
                component:
                  "->$0Key->$0Comp-CompChild:properties.name||->$0Key->$0Comp:properties.name||->$0Key->$0DataType->$0Default:properties.name",
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
                  displayExpr: `properties.${IdAttr}`,
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
                      displayExpr: `properties.${IdAttr}`,
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
        name: "Child",
        component: "Table",
        tab: "Child",
        props: { skip: true },
        attributes: [
          {
            name: "coll",
            component: "SelectBox",
            props: {
              displayExpr: `properties.${IdAttr}`,
              collection: "Coll",
            },
          },
          {
            name: "name",
            component: "TextBox",
          },
          {
            name: "tab",
            component: "SelectBox",
            props: {
              displayExpr: `properties.${IdAttr}`,
              collection: "-CollChild->$0Tab",
            },
          },
          {
            name: "group",
            component: "SelectBox",
            props: {
              collection: "-CollChild->$0Group",
              displayExpr: `properties.${IdAttr}`,
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
                  displayExpr: "properties.key",
                  collection: "Comp[Table]->$0Prop",
                },
              },
              {
                name: "value",
                meta: "->$0Key->$0Comp-CompChild->$0Prop+->$0Key->$0Comp->$0Prop+->$0Key->$0ValueProp",
                component: "->$0Key->$0Comp-CompChild:properties.name||->$0Key->$0Comp:properties.name",
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
              displayExpr: `properties.${IdAttr}`,
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
                  displayExpr: `properties.${IdAttr}`,
                  collection: "Perm",
                },
              },
            ],
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
      { name: "table", component: "CheckBox" },
      { name: "local", component: "CheckBox" },
      {
        name: "coll",
        displayName: "Collection",
        component: "SelectBox",
        props: {
          displayExpr: `properties.${IdAttr}`,
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
              displayExpr: "->$0Attr:properties.name",
              collection: "-$0-Coll$0->$0Attr",
            },
          },
          {
            name: "displayName",
            component: "TextBox",
            props: {
              defaultValue: "->$0Attr:properties.displayName||->$0Attr->$0Attr:properties.displayName",
            },
          },
          {
            name: "tab",
            component: "SelectBox",
            props: {
              collection: "-$0-Coll$0->$0Tab",
              displayExpr: `properties.${IdAttr}`,
              defaultValue: "->$0Attr->$0Tab:properties.name",
            },
          },
          {
            name: "group",
            component: "SelectBox",
            props: {
              collection: "-$0-Coll$0->$0Group",
              displayExpr: `properties.${IdAttr}`,
              defaultValue: "->$0Attr->$0Group:properties.name",
            },
          },
          {
            name: "dataType",
            component: "SelectBox",
            props: {
              collection: "DataType",
              displayExpr: `properties.${IdAttr}`,
              hidden: true,
              defaultValue: "->$0Attr->$0Attr->$0DataType:properties.name",
            },
          },
          {
            name: "Comp",
            displayName: "Component",
            component: "SelectBox",
            props: {
              displayExpr: `properties.${IdAttr}`,
              collection: "->$0Attr->$0Attr->$0DataType->$0Comp",
              defaultValue: "->$0Attr->$0Comp:properties.name||->$0Attr->$0Attr->$0Comp:properties.name",
            },
          },
          {
            name: "required",
            component: "CheckBox",
            props: {
              defaultValue: "->$0Attr:properties.required||->$0Attr->$0Attr:properties.required",
            },
          },
          {
            name: "disabled",
            component: "CheckBox",
            props: {
              defaultValue: "->$0Attr:properties.disabled||->$0Attr->$0Attr:properties.disabled",
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
                  displayExpr: "properties.key",
                  collection: "-$0->$0Comp->$0Prop||-$0->$0Attr->$0Attr->$0Comp->$0Prop",
                },
              },
              {
                name: "value",
                meta: "->$0Key->$0Comp-CompChild->$0Prop+->$0Key->$0Comp->$0Prop+->$0Key->$0ValueProp",
                component: "->$0Key->$0Comp-CompChild:properties.name||->$0Key->$0Comp:properties.name",
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
              displayExpr: "->$0Coll:properties.name",
              collection: "-$0-Coll$0->$0Child",
            },
          },
          {
            name: "tab",
            component: "SelectBox",
            props: {
              collection: "-$0-Coll$0->$0Tab",
              displayExpr: `properties.${IdAttr}`,
              defaultValue: "->$0Coll->$0Tab:properties.name",
            },
          },
          {
            name: "group",
            component: "SelectBox",
            props: {
              collection: "-$0-Coll$0->$0Group",
              displayExpr: `properties.${IdAttr}`,
              defaultValue: "->$0Coll->$0Group:properties.name",
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
                  displayExpr: "->$0Attr:properties.name",
                  collection: "-$0->$0Coll->$0Coll->$0Attr",
                },
              },
              {
                name: "dataType",
                component: "SelectBox",
                props: {
                  collection: "DataType",
                  displayExpr: `properties.${IdAttr}`,
                  hidden: true,
                  defaultValue: "->$0Attr->$0Attr->$0DataType:properties.name",
                },
              },
              {
                name: "Comp",
                displayName: "Component",
                component: "SelectBox",
                props: {
                  displayExpr: `properties.${IdAttr}`,
                  collection: "->$0Attr->$0Attr->$0DataType->$0Comp",
                  defaultValue: "->$0Attr->$0Comp:properties.name||->$0Attr->$0Attr->$0Comp:properties.name",
                },
              },
              {
                name: "displayName",
                component: "TextBox",
                props: {
                  defaultValue: "->$0Attr:properties.displayName||->$0Attr->$0Attr:properties.displayName",
                },
              },
              {
                name: "required",
                component: "CheckBox",
                props: {
                  defaultValue: "->$0Attr:properties.required||->$0Attr->$0Attr:properties.required",
                },
              },
              {
                name: "disabled",
                component: "CheckBox",
                props: {
                  defaultValue: "->$0Attr:properties.disabled||->$0Attr->$0Attr:properties.disabled",
                },
              },
              {
                name: "child",
                component: "SelectBox",
                props: {
                  displayExpr: `properties.${IdAttr}`,
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
                      displayExpr: "properties.key",
                      collection: "-$0->$0Comp->$0Prop||-$0->$0Attr->$0Attr->$0Comp->$0Prop",
                    },
                  },
                  {
                    name: "value",
                    meta: "->$0Key->$0Comp-CompChild->$0Prop+->$0Key->$0Comp->$0Prop+->$0Key->$0ValueProp",
                    component: "->$0Key->$0Comp-CompChild:properties.name||->$0Key->$0Comp:properties.name",
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
      {
        name: "role",
        component: "TagBox",
        props: {
          displayExpr: `properties.${IdAttr}`,
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
  SimpleImport: {
    title: "Simple Insert",
    name: "SimpleImport",
    local: true,
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
    local: true,
    attributes: [
      { name: "email", component: "TextBox" },
      {
        name: "password",
        component: "TextBox",
        props: { mode: "password" },
      },
    ],
  },
  LogIn: {
    title: "User",
    name: "User",
    local: true,
    attributes: [
      { name: "email", component: "TextBox" },
      {
        name: "password",
        component: "TextBox",
        props: { mode: "password" },
      },
    ],
  },
  _PageData: {
    title: "User",
    name: "User",
    local: true,
    attributes: [
      {
        name: "coll",
        component: "SelectBox",
        props: {
          displayExpr: `properties.${IdAttr}`,
          collection: "Coll",
        },
      },
      {
        name: "data",
        component: "SelectBox",
        props: {
          displayExpr: `properties.${IdAttr}`,
          collection: "{->$0Coll:properties[IdAttr]}",
        },
      },
    ],
  },
  // TODO: Dynamic Filter on Grid: Role->Filter
};
const PageMetaData = klona(AttrsTableData.Form);
PageMetaData.title = "Page";
PageMetaData.name = "Page";
PageMetaData.attributes = PageMetaData.attributes.filter((attr) => !["table"].includes(attr.id));
AttrsTableData.Page = klona(PageMetaData);
// window.a = AttrsTableData;
