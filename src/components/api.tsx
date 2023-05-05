import { FormMetaData } from "./Form";
import { klona } from "klona";
import {
  findVertexByLabelAndUniqueId,
  findVertexByLabelAndUniqueIdWithSkip
} from "../lib/Vertex";
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
      { id: "id", component: "TextBoxField" },
      {
        id: "default",
        displayName: "Default Component",
        component: "SelectBoxField",
        props: {
          displayExpr: "properties.id",
          collection: "Comp",
          skip: true
        },
      },
    ],
  },
  Comp: {
    title: "Component",
    id: "Comp",
    attributes: [
      { id: "id", component: "TextBoxField" },
      {
        id: "parent",
        displayName: "Parent Component",
        component: "SelectBoxField",
        props: {
          displayExpr: "properties.id",
          collection: "Comp",
          inward: true,
          parentLabel: "Comp",
          childLabel: "Child",
          skip: true
        },
      },
      {
        id: "dataType",
        displayName: "DataType",
        component: "SelectBoxField",
        props: {
          displayExpr: "properties.id",
          collection: "DataType",
          inward: true,
          parentLabel: "DataType"
        },
      },
      {
        id: "Prop",
        component: "TableField",
        tab: "Properties",
        attributes: [
          {
            id: "key",
            component: "TextBoxField",
          },
          {
            id: "dataType",
            component: "SelectBoxField",
            props: {
              displayExpr: "properties.id",
              collection: "DataType",
              onchange: '["Comp",null]',
            },
          },
          {
            id: "Comp",
            displayName: "Component",
            component: "SelectBoxField",
            props: {
              displayExpr: "properties.id",
              collection: "->$0DataType->$0Comp",
            },
          },
          {
            // TODO: Be sure the name is ok, it will not change in production.
            id: "valueProp",
            displayName: "Value Property",
            component: "TableField",
            tab: "Properties",
            attributes: [
              {
                id: "key",
                component: "SelectBoxField",
                props: {
                  displayExpr: "properties.key",
                  collection: "-$0->$0Comp->$0Prop",
                },
              },
              {
                id: "value",
                meta: "->$0Key->$0Comp-CompChild->$0Prop+->$0Key->$0Comp->$0Prop",
                component: "->$0Key->$0Comp-CompChild:properties.id||->$0Key->$0Comp:properties.id",
              },
            ],
          },
          {
            id: "value",
            meta: "->$0Comp-CompChild->$0Prop+->$0Comp->$0Prop+->$0ValueProp",
            component: "->$0Comp-CompChild:properties.id||->$0Comp:properties.id",
          },
        ],
      },
    ],
  },
  CollCategory: {
    title: "Collection Category",
    id: "CollCategory",
    attributes: [
      { id: "id", component: "TextBoxField" },
      { id: "description", component: "TextAreaField" },
    ],
  },

  // TODO: Coll has only one Attr. Add validation for that.
  Coll: {
    title: "Collection",
    id: "Coll",
    attributes: [
      { id: "title", component: "TextBoxField", props:{
          onchange: '{"new": ["id","label"]}',
        } },
      { id: "id", component: "TextBoxField", props: {
          validationRules: [{
            type: 'required',
            message: 'ID is required',
          },{
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
            }
          }
            // , {
            //   type: 'email',
            //   message: 'Email is invalid',
            // }
          ],
        } },
      // {
      //   id: "category",
      //   component: "SelectBoxField",
      //   props: {
      //     displayExpr: "properties.id",
      //     collection: "CollCategory",
      //     parentLabel: "CollCategory",
      //     inward: true,
      //     skip: true
      //   },
      // },
      { id: "description", component: "TextAreaField" },
      { id: "table", component: "CheckBoxField" },
      { id: "public", component: "CheckBoxField", props: {skip: true}, },
      {
        id: "Tab",
        component: "TableField",
        tab: "Organize",
        props: {skip: true},
        attributes: [
          {
            id: "id",
            component: "TextBoxField",
          },
          {
            id: "name",
            component: "TextBoxField",
          },
        ],
      },
      {
        id: "Group",
        component: "TableField",
        tab: "Organize",
        props: {skip: true},
        attributes: [
          {
            id: "id",
            component: "TextBoxField",
          },
          {
            id: "name",
            component: "TextBoxField",
          },
        ],
      },
      {
        id: "Role",
        component: "TableField",
        tab: "Permission",
        props: {skip: true},
        attributes: [
          {
            id: "role",
            component: "SelectBoxField",
            props: {
              displayExpr: "properties.id",
              collection: "Role",
            },
          },
          {
            id: "Perm",
            component: "TableField",
            attributes: [
              {
                id: "perm",
                component: "SelectBoxField",
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
        component: "TableField",
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
            component: "TextBoxField",
            props: {
            },
          },
          {
            id: "displayName",
            component: "TextBoxField",
          },
          {
            id: "definition",
            component: "TextAreaField",
          },
          {
            id: "tab",
            component: "SelectBoxField",
            props: {
              displayExpr: "properties.id",
              collection: "-CollAttr->$0Tab",
              skip: true
            },
          },
          {
            id: "group",
            component: "SelectBoxField",
            props: {
              collection: "-CollAttr->$0Group",
              displayExpr: "properties.id",
              skip: true
            },
          },
          {
            id: "dataType",
            component: "SelectBoxField",
            props: {
              displayExpr: "properties.id",
              collection: "DataType",
              skip: true
            },
          },
          {
            id: "Comp",
            component: "SelectBoxField",
            props: {
              displayExpr: "properties.id",
              collection: "->$0DataType->$0Comp",
              // smaller version:
              // collection: "Comp",
            },
          },

          {
            id: "unique",
            component: "CheckBoxField",
            props: {
              skip: true
            },
          },
          {
            id: "required",
            component: "CheckBoxField",
            props: {
              skip: true
            },
          },
          {
            id: "disabled",
            component: "CheckBoxField",
            props: {
              skip: true
            },
          },
          {
            id: "Prop",
            displayName: "Property",
            component: "TableField",
            props: {skip: true},
            attributes: [
              {
                id: "key",
                component: "SelectBoxField",
                props: {
                  displayExpr: "properties.key",
                  collection: "-CollAttrProp->CollAttrComp->$0Prop||-CollAttrProp->$0Attr->$0Comp->$0Prop",
                },
              },
              {
                id: "value",
                meta: "->$0Key->$0Comp-CompChild->$0Prop+->$0Key->$0Comp->$0Prop+->$0Key->$0ValueProp",
                component: "->CollAttrPropKey->$0Comp-CompChild:properties.id||->CollAttrPropKey->$0Comp:properties.id",
              },
            ],
          },
          {
            id: "Role",
            component: "TableField",
            props: {skip: true},
            attributes: [
              {
                id: "role",
                component: "SelectBoxField",
                props: {
                  displayExpr: "properties.id",
                  collection: "Role",
                },
              },
              {
                id: "Perm",
                component: "TableField",
                attributes: [
                  {
                    id: "perm",
                    component: "SelectBoxField",
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
        component: "TableField",
        tab: "Child",
        props: {skip: true},
        attributes: [
          {
            id: "coll",
            component: "SelectBoxField",
            props: {
              displayExpr: "properties.id",
              collection: "Coll",
            },
          },
          {
            id: "id",
            component: "TextBoxField",
          },
          {
            id: "tab",
            component: "SelectBoxField",
            props: {
              displayExpr: "properties.id",
              collection: "-CollChild->$0Tab",
            },
          },
          {
            id: "group",
            component: "SelectBoxField",
            props: {
              collection: "-CollChild->$0Group",
              displayExpr: "properties.id",
            },
          },
          {
            id: "Prop",
            displayName: "Property",
            component: "TableField",
            attributes: [
              {
                id: "key",
                component: "SelectBoxField",
                props: {
                  displayExpr: "properties.key",
                  collection: "Comp[TableField]->$0Prop",
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
      { id: "id", component: "TextBoxField" },
      { id: "title", component: "TextBoxField" },
      { id: "description", component: "TextAreaField" },
      { id: "table", component: "CheckBoxField" },
      { id: "local", component: "CheckBoxField" },
      {
        id: "coll",
        displayName: "Collection",
        component: "SelectBoxField",
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
        component: "TableField",
        tab: "Attribute",
        attributes: [
          {
            id: "Attr",
            displayName: "Attribute",
            component: "SelectBoxField",
            props: {
              displayExpr: "->$0Attr:properties.id",
              collection: "-$0-Coll$0->$0Attr",
            },
          },
          {
            id: "displayName",
            component: "TextBoxField",
            props: {
              defaultValue: "->$0Attr:properties.displayName||->$0Attr->$0Attr:properties.displayName",
            },
          },
          {
            id: "tab",
            component: "SelectBoxField",
            props: {
              collection: "-$0-Coll$0->$0Tab",
              displayExpr: "properties.id",
              defaultValue: "->$0Attr->$0Tab:properties.id",
            },
          },
          {
            id: "group",
            component: "SelectBoxField",
            props: {
              collection: "-$0-Coll$0->$0Group",
              displayExpr: "properties.id",
              defaultValue: "->$0Attr->$0Group:properties.id",
            },
          },
          {
            id: "dataType",
            component: "SelectBoxField",
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
            component: "SelectBoxField",
            props: {
              displayExpr: "properties.id",
              collection: "->$0Attr->$0Attr->$0DataType->$0Comp",
              defaultValue:
                "->$0Attr->$0Comp:properties.id||->$0Attr->$0Attr->$0Comp:properties.id",
            },
          },
          {
            id: "required",
            component: "CheckBoxField",
            props: {
              defaultValue: "->$0Attr:properties.required||->$0Attr->$0Attr:properties.required",
            },
          },
          {
            id: "disabled",
            component: "CheckBoxField",
            props: {
              defaultValue: "->$0Attr:properties.disabled||->$0Attr->$0Attr:properties.disabled",
            },
          },
          {
            id: "Prop",
            displayName: "Property",
            component: "TableField",
            attributes: [
              {
                id: "key",
                component: "SelectBoxField",
                props: {
                  displayExpr: "properties.key",
                  collection:
                    "-$0->$0Comp->$0Prop||-$0->$0Attr->$0Attr->$0Comp->$0Prop",
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
        component: "TableField",
        tab: "Children",
        attributes: [
          {
            id: "Coll",
            displayName: "Collection",
            component: "SelectBoxField",
            props: {
              displayExpr: "->$0Coll:properties.id",
              collection: "-$0-Coll$0->$0Child",
            },
          },
          {
            id: "tab",
            component: "SelectBoxField",
            props: {
              collection: "-$0-Coll$0->$0Tab",
              displayExpr: "properties.id",
              defaultValue: "->$0Coll->$0Tab:properties.id",
            },
          },
          {
            id: "group",
            component: "SelectBoxField",
            props: {
              collection: "-$0-Coll$0->$0Group",
              displayExpr: "properties.id",
              defaultValue: "->$0Coll->$0Group:properties.id",
            },
          },
          {
            id: "Attr",
            displayName: "Attribute",
            component: "TableField",
            attributes: [
              {
                id: "Attr",
                displayName: "Attribute",
                component: "SelectBoxField",
                props: {
                  displayExpr: "->$0Attr:properties.id",
                  collection: "-$0->$0Coll->$0Coll->$0Attr",
                },
              },
              {
                id: "dataType",
                component: "SelectBoxField",
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
                component: "SelectBoxField",
                props: {
                  displayExpr: "properties.id",
                  collection: "->$0Attr->$0Attr->$0DataType->$0Comp",
                  defaultValue:
                    "->$0Attr->$0Comp:properties.id||->$0Attr->$0Attr->$0Comp:properties.id",
                },
              },
              {
                id: "displayName",
                component: "TextBoxField",
                props: {
                  defaultValue:
                    "->$0Attr:properties.displayName||->$0Attr->$0Attr:properties.displayName",
                },
              },
              {
                id: "required",
                component: "CheckBoxField",
                props: {
                  defaultValue:
                    "->$0Attr:properties.required||->$0Attr->$0Attr:properties.required",
                },
              },
              {
                id: "disabled",
                component: "CheckBoxField",
                props: {
                  defaultValue:
                    "->$0Attr:properties.disabled||->$0Attr->$0Attr:properties.disabled",
                },
              },
              {
                id: "child",
                component: "SelectBoxField",
                props: {
                  displayExpr: "properties.id",
                  collection: "Form",
                },
              },
              {
                id: "Prop",
                component: "TableField",
                attributes: [
                  {
                    id: "key",
                    component: "SelectBoxField",
                    props: {
                      displayExpr: "properties.key",
                      collection:
                        "-$0->$0Comp->$0Prop||-$0->$0Attr->$0Attr->$0Comp->$0Prop",
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
      { id: "id", component: "TextBoxField" },
      {
        id: "role",
        component: "TagBoxField",
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
    attributes: [{ id: "id", component: "TextBoxField" }],
  },
  Role: {
    title: "Role",
    id: "Role",
    attributes: [{ id: "id", component: "TextBoxField" }],
  },
  SimpleImport: {
    title: "Simple Insert",
    id: "SimpleImport",
    local: true,
    attributes: [
      {
        id: "csv",
        component: "TextAreaField",
        props: { width: 600, height: 500 },
      },
      { id: "label", component: "TextBoxField" },
      { id: "dry", component: "CheckBoxField" },
      { id: "lookup", component: "TextBoxField" },
      { id: "lookupId", component: "TextBoxField" },
      { id: "lookupChild", component: "TextBoxField" },
      {
        id: "Meta",
        component: "TableField",
        attributes: [
          { id: "column", component: "TextBoxField" },
          // {
          //  id: "column",
          //  component: "SelectBoxField",
          //  props: {
          //   displayExpr: "key",
          //   collection: "Update Dynamically on meta based on first row",
          //  },
          // },
          { id: "attrId", displayName: "Attribute ID", component: "TextBoxField" },
          {
            id: "coll",
            displayName: "Lookup Collection",
            component: "SelectBoxField",
            props: {
              displayExpr: "key",
              collection: "Coll",
            },
          },
          { id: "collLabel", displayName: "Lookup Label", component: "TextBoxField" },
          { id: "inward", component: "CheckBoxField" },
          {
            id: "collId",
            displayName: "Lookup Collection ID",
            component: "TextBoxField",
          },
          { id: "edge", displayName: "Edge Type", component: "TextBoxField" },
          {
            id: "func",
            displayName: "Function",
            component: "SelectBoxField",
            props: {
              stringValue: true,
              displayExpr: "key",
              collection: '[{"key":"dataType","id":"dataType"}, {"id": "lookup", "key": "lookup"}]',
            },
          },
          { id: "skip", component: "CheckBoxField" },
          { id: "skipRow", component: "TextAreaField" },
        ],
      },
    ],
  },
  SignUp: {
    title: "User",
    id: "User",
    local: true,
    attributes: [
      { id: "email", component: "TextBoxField" },
      {
        id: "password",
        component: "TextBoxField",
        props: { mode: "password" },
      },
    ],
  },
  LogIn: {
    title: "User",
    id: "User",
    local: true,
    attributes: [
      { id: "email", component: "TextBoxField" },
      {
        id: "password",
        component: "TextBoxField",
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
        component: "SelectBoxField",
        props: {
          displayExpr: "properties.id",
          collection: "Coll",
        },
      },
      {
        id: "data",
        component: "SelectBoxField",
        props: {
          displayExpr: "properties.id",
          collection: "{->$0Coll:properties.id}",
        },
      },
    ],
  }
  // TODO: Dynamic Filter on Grid: Role->Filter
};
const PageMetaData = klona(AttrsTableData.Form);
PageMetaData.title = "Page";
PageMetaData.id = "Page";
PageMetaData.attributes = PageMetaData.attributes.filter(attr => !["table"].includes(attr.id))
AttrsTableData.Page = klona(PageMetaData);
// window.a = AttrsTableData;
