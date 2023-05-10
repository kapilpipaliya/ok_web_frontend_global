import { FormMetaData } from "./Form";
import { klona } from "klona";
import { findVertexByLabelAndUniqueId, findVertexByLabelAndUniqueIdWithSkip } from "../lib/Vertex";
import { useContext } from "solid-js";
import { FormContext } from "./dynamicForm";

/* use in c++
export const JSONToCypherMap = (json: object) => {
  // https://stackoverflow.com/questions/20841571/how-to-solve-the-dilemma-while-handle-json-in-neo4j-cypher
  return jju.stringify(json, { quote: "'" }).replace(/"/g, "\\x22");
};
*/

export const AttrsTableData: { [key: string]: FormMetaData } = {
  DataType: {
    title: "DataType",
    id: "DataType",
    attributes: [
      { id: "id", component: "TextBox" },
      {
        id: "default",
        displayName: "Default Component",
        component: "SelectBox",
        props: {
          displayExpr: "properties.id",
          collection: "Comp",
          skip: true,
        },
      },
    ],
  },
  CompCategory: {
    title: "Component Category",
    id: "CompCategory",
    attributes: [
      { id: "id", component: "TextBox" },
      { id: "description", component: "TextArea" },
    ],
  },

  Comp: {
    title: "Component",
    id: "Comp",
    attributes: [
      { id: "id", component: "TextBox" },
      {
        id: "parent",
        displayName: "Parent Component",
        component: "SelectBox",
        props: {
          displayExpr: "properties.id",
          collection: "Comp",
          inward: true,
          parentLabel: "Comp",
          childLabel: "Child",
          skip: true,
        },
      },
      {
        id: "dataType",
        displayName: "DataType",
        component: "SelectBox",
        props: {
          displayExpr: "properties.id",
          collection: "DataType",
          inward: true,
          parentLabel: "DataType",
        },
      },
      {
        id: "category",
        component: "SelectBox",
        props: {
          displayExpr: "properties.id",
          collection: "CompCategory",
          parentLabel: "CompCategory",
          inward: true,
          skip: true,
        },
      },
      {
        id: "Prop",
        component: "Table",
        tab: "Properties",
        attributes: [
          {
            id: "key",
            component: "TextBox",
          },
          {
            id: "description",
            component: "TextArea",
            props: {
              // autoResizeEnabled: true,
              width: "550px",
            },
          },
          {
            id: "dataType",
            component: "SelectBox",
            props: {
              displayExpr: "properties.id",
              collection: "DataType",
              onchange: '["Comp",null]',
            },
          },
          {
            id: "Comp",
            displayName: "Component",
            component: "SelectBox",
            props: {
              displayExpr: "properties.id",
              collection: "->$0DataType->$0Comp",
            },
          },
          // {
          //   // TODO: Be sure the name is ok, it will not change in production.
          //   id: "valueProp",
          //   displayName: "Value Property",
          //   component: "Table",
          //   tab: "Properties",
          //   attributes: [
          //     {
          //       id: "key",
          //       component: "SelectBox",
          //       props: {
          //         displayExpr: "properties.key",
          //         collection: "-$0->$0Comp->$0Prop",
          //       },
          //     },
          //     {
          //       id: "value",
          //       meta: "->$0Key->$0Comp-CompChild->$0Prop+->$0Key->$0Comp->$0Prop",
          //       component: "->$0Key->$0Comp-CompChild:properties.id||->$0Key->$0Comp:properties.id",
          //     },
          //   ],
          // },
          {
            id: "value",
            meta: "->$0Comp-CompChild->$0Prop+->$0Comp->$0Prop+->$0ValueProp",
            component:
              "->$0Comp-CompChild:properties.id||->$0Comp:properties.id||->$0DataType->$0Default:properties.id",
            // component: "->$0Comp-CompChild:properties.id||->$0Comp:properties.id||->$0DataType->$0Default:properties.id||defaultComp|->$0DataType:properties.id",
          },
          {
            id: "reset",
            component: "Button",
            props: {
              function: "reset",
              onchange: '{"new": ["value","clear"], "edit": ["value","clear"]}',
            },
          },
        ],
      },
    ],
  },
  CollCategory: {
    title: "Collection Category",
    id: "CollCategory",
    attributes: [
      { id: "id", component: "TextBox" },
      { id: "description", component: "TextArea" },
    ],
  },

  // TODO: Coll has only one Attr. Add validation for that.
  Coll: {
    title: "Collection",
    id: "Coll",
    attributes: [
      {
        id: "title",
        component: "TextBox",
        props: {
          onchange: '{"new": ["id","label"]}',
        },
      },
      {
        id: "id",
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
      //   id: "category",
      //   component: "SelectBox",
      //   props: {
      //     displayExpr: "properties.id",
      //     collection: "CollCategory",
      //     parentLabel: "CollCategory",
      //     inward: true,
      //     skip: true
      //   },
      // },
      { id: "description", component: "TextArea" },
      { id: "table", component: "CheckBox" },
      { id: "public", component: "CheckBox", props: { skip: true } },
      {
        id: "Tab",
        component: "Table",
        tab: "Organize",
        props: { skip: true },
        attributes: [
          {
            id: "id",
            component: "TextBox",
          },
          {
            id: "name",
            component: "TextBox",
          },
        ],
      },
      {
        id: "Group",
        component: "Table",
        tab: "Organize",
        props: { skip: true },
        attributes: [
          {
            id: "id",
            component: "TextBox",
          },
          {
            id: "name",
            component: "TextBox",
          },
        ],
      },
      {
        id: "Role",
        component: "Table",
        tab: "Permission",
        props: { skip: true },
        attributes: [
          {
            id: "role",
            component: "SelectBox",
            props: {
              displayExpr: "properties.id",
              collection: "Role",
            },
          },
          {
            id: "Perm",
            component: "Table",
            attributes: [
              {
                id: "perm",
                component: "SelectBox",
                props: {
                  displayExpr: "properties.id",
                  collection: "Perm",
                },
              },
            ],
          },
        ],
      },
      {
        id: "Attr",
        component: "Table",
        tab: "Attribute",
        props: {
          // unique: 'Attr',
          // kanban: true,
          // collection: "Attr",
        },
        attributes: [
          {
            id: "id",
            displayName: "ID",
            component: "TextBox",
            props: {},
          },
          {
            id: "displayName",
            component: "TextBox",
          },
          {
            id: "definition",
            component: "TextArea",
          },
          {
            id: "tab",
            component: "SelectBox",
            props: {
              displayExpr: "properties.id",
              collection: "-CollAttr->$0Tab",
              skip: true,
            },
          },
          {
            id: "group",
            component: "SelectBox",
            props: {
              collection: "-CollAttr->$0Group",
              displayExpr: "properties.id",
              skip: true,
            },
          },
          {
            id: "dataType",
            component: "SelectBox",
            props: {
              displayExpr: "properties.id",
              collection: "DataType",
              skip: true,
            },
          },
          {
            id: "Comp",
            component: "SelectBox",
            props: {
              displayExpr: "properties.id",
              collection: "->$0DataType->$0Comp",
              // smaller version:
              // collection: "Comp",
            },
          },

          {
            id: "unique",
            component: "CheckBox",
            props: {
              skip: true,
            },
          },
          {
            id: "required",
            component: "CheckBox",
            props: {
              skip: true,
            },
          },
          {
            id: "disabled",
            component: "CheckBox",
            props: {
              skip: true,
            },
          },
          {
            id: "Prop",
            displayName: "Property",
            component: "Table",
            props: { skip: true },
            attributes: [
              {
                id: "key",
                component: "SelectBox",
                props: {
                  displayExpr: "properties.key",
                  collection: "-CollAttrProp->CollAttrComp->$0Prop||-CollAttrProp->$0Attr->$0Comp->$0Prop",
                },
              },
              {
                id: "value",
                meta: "->$0Key->$0Comp-CompChild->$0Prop+->$0Key->$0Comp->$0Prop+->$0Key->$0ValueProp",
                component:
                  "->$0Key->$0Comp-CompChild:properties.id||->$0Key->$0Comp:properties.id||->$0Key->$0DataType->$0Default:properties.id",
              },
            ],
          },
          {
            id: "Role",
            component: "Table",
            props: { skip: true },
            attributes: [
              {
                id: "role",
                component: "SelectBox",
                props: {
                  displayExpr: "properties.id",
                  collection: "Role",
                },
              },
              {
                id: "Perm",
                component: "Table",
                attributes: [
                  {
                    id: "perm",
                    component: "SelectBox",
                    props: {
                      displayExpr: "properties.id",
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
        id: "Child",
        component: "Table",
        tab: "Child",
        props: { skip: true },
        attributes: [
          {
            id: "coll",
            component: "SelectBox",
            props: {
              displayExpr: "properties.id",
              collection: "Coll",
            },
          },
          {
            id: "id",
            component: "TextBox",
          },
          {
            id: "tab",
            component: "SelectBox",
            props: {
              displayExpr: "properties.id",
              collection: "-CollChild->$0Tab",
            },
          },
          {
            id: "group",
            component: "SelectBox",
            props: {
              collection: "-CollChild->$0Group",
              displayExpr: "properties.id",
            },
          },
          {
            id: "Prop",
            displayName: "Property",
            component: "Table",
            attributes: [
              {
                id: "key",
                component: "SelectBox",
                props: {
                  displayExpr: "properties.key",
                  collection: "Comp[Table]->$0Prop",
                },
              },
              {
                id: "value",
                meta: "->$0Key->$0Comp-CompChild->$0Prop+->$0Key->$0Comp->$0Prop+->$0Key->$0ValueProp",
                component: "->$0Key->$0Comp-CompChild:properties.id||->$0Key->$0Comp:properties.id",
              },
            ],
          },
        ],
      },
    ],
  },

  Form: {
    title: "Form",
    id: "Form",
    attributes: [
      { id: "id", component: "TextBox" },
      { id: "title", component: "TextBox" },
      { id: "description", component: "TextArea" },
      { id: "table", component: "CheckBox" },
      { id: "local", component: "CheckBox" },
      {
        id: "coll",
        displayName: "Collection",
        component: "SelectBox",
        props: {
          displayExpr: "properties.id",
          collection: "Coll",
          inward: true,
          parentLabel: "Coll",
        },
      },
      {
        id: "Attr",
        displayName: "Attribute",
        component: "Table",
        tab: "Attribute",
        attributes: [
          {
            id: "Attr",
            displayName: "Attribute",
            component: "SelectBox",
            props: {
              displayExpr: "->$0Attr:properties.id",
              collection: "-$0-Coll$0->$0Attr",
            },
          },
          {
            id: "displayName",
            component: "TextBox",
            props: {
              defaultValue: "->$0Attr:properties.displayName||->$0Attr->$0Attr:properties.displayName",
            },
          },
          {
            id: "tab",
            component: "SelectBox",
            props: {
              collection: "-$0-Coll$0->$0Tab",
              displayExpr: "properties.id",
              defaultValue: "->$0Attr->$0Tab:properties.id",
            },
          },
          {
            id: "group",
            component: "SelectBox",
            props: {
              collection: "-$0-Coll$0->$0Group",
              displayExpr: "properties.id",
              defaultValue: "->$0Attr->$0Group:properties.id",
            },
          },
          {
            id: "dataType",
            component: "SelectBox",
            props: {
              collection: "DataType",
              displayExpr: "properties.id",
              hidden: true,
              defaultValue: "->$0Attr->$0Attr->$0DataType:properties.id",
            },
          },
          {
            id: "Comp",
            displayName: "Component",
            component: "SelectBox",
            props: {
              displayExpr: "properties.id",
              collection: "->$0Attr->$0Attr->$0DataType->$0Comp",
              defaultValue: "->$0Attr->$0Comp:properties.id||->$0Attr->$0Attr->$0Comp:properties.id",
            },
          },
          {
            id: "required",
            component: "CheckBox",
            props: {
              defaultValue: "->$0Attr:properties.required||->$0Attr->$0Attr:properties.required",
            },
          },
          {
            id: "disabled",
            component: "CheckBox",
            props: {
              defaultValue: "->$0Attr:properties.disabled||->$0Attr->$0Attr:properties.disabled",
            },
          },
          {
            id: "Prop",
            displayName: "Property",
            component: "Table",
            attributes: [
              {
                id: "key",
                component: "SelectBox",
                props: {
                  displayExpr: "properties.key",
                  collection: "-$0->$0Comp->$0Prop||-$0->$0Attr->$0Attr->$0Comp->$0Prop",
                },
              },
              {
                id: "value",
                meta: "->$0Key->$0Comp-CompChild->$0Prop+->$0Key->$0Comp->$0Prop+->$0Key->$0ValueProp",
                component: "->$0Key->$0Comp-CompChild:properties.id||->$0Key->$0Comp:properties.id",
              },
            ],
          },
        ],
      },
      {
        id: "Child",
        displayName: "Children",
        component: "Table",
        tab: "Children",
        attributes: [
          {
            id: "Coll",
            displayName: "Collection",
            component: "SelectBox",
            props: {
              displayExpr: "->$0Coll:properties.id",
              collection: "-$0-Coll$0->$0Child",
            },
          },
          {
            id: "tab",
            component: "SelectBox",
            props: {
              collection: "-$0-Coll$0->$0Tab",
              displayExpr: "properties.id",
              defaultValue: "->$0Coll->$0Tab:properties.id",
            },
          },
          {
            id: "group",
            component: "SelectBox",
            props: {
              collection: "-$0-Coll$0->$0Group",
              displayExpr: "properties.id",
              defaultValue: "->$0Coll->$0Group:properties.id",
            },
          },
          {
            id: "Attr",
            displayName: "Attribute",
            component: "Table",
            attributes: [
              {
                id: "Attr",
                displayName: "Attribute",
                component: "SelectBox",
                props: {
                  displayExpr: "->$0Attr:properties.id",
                  collection: "-$0->$0Coll->$0Coll->$0Attr",
                },
              },
              {
                id: "dataType",
                component: "SelectBox",
                props: {
                  collection: "DataType",
                  displayExpr: "properties.id",
                  hidden: true,
                  defaultValue: "->$0Attr->$0Attr->$0DataType:properties.id",
                },
              },
              {
                id: "Comp",
                displayName: "Component",
                component: "SelectBox",
                props: {
                  displayExpr: "properties.id",
                  collection: "->$0Attr->$0Attr->$0DataType->$0Comp",
                  defaultValue: "->$0Attr->$0Comp:properties.id||->$0Attr->$0Attr->$0Comp:properties.id",
                },
              },
              {
                id: "displayName",
                component: "TextBox",
                props: {
                  defaultValue: "->$0Attr:properties.displayName||->$0Attr->$0Attr:properties.displayName",
                },
              },
              {
                id: "required",
                component: "CheckBox",
                props: {
                  defaultValue: "->$0Attr:properties.required||->$0Attr->$0Attr:properties.required",
                },
              },
              {
                id: "disabled",
                component: "CheckBox",
                props: {
                  defaultValue: "->$0Attr:properties.disabled||->$0Attr->$0Attr:properties.disabled",
                },
              },
              {
                id: "child",
                component: "SelectBox",
                props: {
                  displayExpr: "properties.id",
                  collection: "Form",
                },
              },
              {
                id: "Prop",
                component: "Table",
                attributes: [
                  {
                    id: "key",
                    component: "SelectBox",
                    props: {
                      displayExpr: "properties.key",
                      collection: "-$0->$0Comp->$0Prop||-$0->$0Attr->$0Attr->$0Comp->$0Prop",
                    },
                  },
                  {
                    id: "value",
                    meta: "->$0Key->$0Comp-CompChild->$0Prop+->$0Key->$0Comp->$0Prop+->$0Key->$0ValueProp",
                    component: "->$0Key->$0Comp-CompChild:properties.id||->$0Key->$0Comp:properties.id",
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
    id: "User",
    attributes: [
      { id: "id", component: "TextBox" },
      {
        id: "role",
        component: "TagBox",
        props: {
          displayExpr: "properties.id",
          collection: "Role",
        },
      },
    ],
  },
  Perm: {
    title: "Perm",
    id: "Perm",
    attributes: [{ id: "id", component: "TextBox" }],
  },
  Role: {
    title: "Role",
    id: "Role",
    attributes: [{ id: "id", component: "TextBox" }],
  },
  SimpleImport: {
    title: "Simple Insert",
    id: "SimpleImport",
    local: true,
    attributes: [
      {
        id: "csv",
        component: "TextArea",
        props: { width: 600, height: 500 },
      },
      { id: "label", component: "TextBox" },
      { id: "dry", component: "CheckBox" },
      { id: "lookup", component: "TextBox" },
      { id: "lookupId", component: "TextBox" },
      { id: "lookupChild", component: "TextBox" },
      {
        id: "Meta",
        component: "Table",
        attributes: [
          { id: "column", component: "TextBox" },
          // {
          //  id: "column",
          //  component: "SelectBox",
          //  props: {
          //   displayExpr: "key",
          //   collection: "Update Dynamically on meta based on first row",
          //  },
          // },
          { id: "attrId", displayName: "Attribute ID", component: "TextBox" },
          {
            id: "coll",
            displayName: "Lookup Collection",
            component: "SelectBox",
            props: {
              displayExpr: "key",
              collection: "Coll",
            },
          },
          { id: "collLabel", displayName: "Lookup Label", component: "TextBox" },
          { id: "inward", component: "CheckBox" },
          {
            id: "collId",
            displayName: "Lookup Collection ID",
            component: "TextBox",
          },
          { id: "edge", displayName: "Edge Type", component: "TextBox" },
          {
            id: "func",
            displayName: "Function",
            component: "SelectBox",
            props: {
              stringValue: true,
              displayExpr: "key",
              collection: '[{"key":"dataType","id":"dataType"}, {"id": "lookup", "key": "lookup"}]',
            },
          },
          { id: "skip", component: "CheckBox" },
          { id: "skipRow", component: "TextArea" },
        ],
      },
    ],
  },
  SignUp: {
    title: "User",
    id: "User",
    local: true,
    attributes: [
      { id: "email", component: "TextBox" },
      {
        id: "password",
        component: "TextBox",
        props: { mode: "password" },
      },
    ],
  },
  LogIn: {
    title: "User",
    id: "User",
    local: true,
    attributes: [
      { id: "email", component: "TextBox" },
      {
        id: "password",
        component: "TextBox",
        props: { mode: "password" },
      },
    ],
  },
  _PageData: {
    title: "User",
    id: "User",
    local: true,
    attributes: [
      {
        id: "coll",
        component: "SelectBox",
        props: {
          displayExpr: "properties.id",
          collection: "Coll",
        },
      },
      {
        id: "data",
        component: "SelectBox",
        props: {
          displayExpr: "properties.id",
          collection: "{->$0Coll:properties.id}",
        },
      },
    ],
  },
  // TODO: Dynamic Filter on Grid: Role->Filter
};
const PageMetaData = klona(AttrsTableData.Form);
PageMetaData.title = "Page";
PageMetaData.id = "Page";
PageMetaData.attributes = PageMetaData.attributes.filter((attr) => !["table"].includes(attr.id));
AttrsTableData.Page = klona(PageMetaData);
// window.a = AttrsTableData;
