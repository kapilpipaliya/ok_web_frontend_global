import { FormMetaData } from "./Form";
import { klona } from "klona";

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
        title: "Parent Component",
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
        title: "DataType",
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
            title: "Component",
            component: "SelectBoxField",
            props: {
              displayExpr: "properties.id",
              collection: "->$0DataType->$0Comp",
            },
          },
          {
            // TODO: Be sure the name is ok, it will not change in production.
            id: "valueProp",
            title: "Value Property",
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
  AttrType: {
    title: "Attribute",
    id: "Attr",
    attributes: [
      { id: "id", component: "TextBoxField" },
      { id: "description", component: "TextAreaField" },
    ],
  },
  Attr: {
    title: "Attribute",
    id: "Attr",
    attributes: [
      { id: "id", component: "TextBoxField" },
      {
        id: "dataType",
        component: "SelectBoxField",
        props: {
          displayExpr: "properties.id",
          collection: "DataType",
          onchange: '["Comp",null]',
          skip: true
        },
      },
      {
        id: "Comp",
        title: "Component",
        component: "SelectBoxField",
        props: {
          displayExpr: "properties.id",
          // collection: "->$0DataType->$0Comp",
          collection: "Comp",
        },
      },
      {
        id: "attrType",
        title: "Attribute Type",
        component: "SelectBoxField",
        props: {
          displayExpr: "properties.id",
          collection: "AttrType",
          skip: true,
        },
      },
      { id: "title", component: "TextBoxField" },
      { id: "description", component: "TextAreaField" },
      { id: "unique", component: "CheckBoxField",props: { skip: true} },
      { id: "required", component: "CheckBoxField",props: { skip: true} },
      { id: "disabled", component: "CheckBoxField",props: { skip: true} },
      {
        id: "Prop",
        component: "TableField",
        props: { skip: true},
        attributes: [
          {
            id: "key",
            component: "SelectBoxField",
            props: {
              displayExpr: "properties.key",
              collection: "-AttrProp->$0Comp->$0Prop",
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
      { id: "id", component: "TextBoxField" },
      {
        id: "category",
        component: "SelectBoxField",
        props: {
          displayExpr: "properties.id",
          collection: "CollCategory",
          skip: true
        },
      },
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
        // tab: "Attribute",
        props: {
          unique: 'Attr',
          kanban: true,
          collection: "Attr",
        },
        attributes: [
          {
            id: "Attr",
            title: "Attribute",
            component: "SelectBoxField",
            props: {
              displayExpr: "properties.id",
              collection: "Attr",
            },
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
              hidden: true,
              disabled: true,
              defaultValue: "->$0Attr->$0DataType:properties.id",
              skip: true
            },
          },
          {
            id: "Comp",
            component: "SelectBoxField",
            props: {
              displayExpr: "properties.id",
              // collection: "->$0Attr->$0DataType->$0Comp",
              collection: "Comp",
              defaultValue: "->$0Attr->$0Comp:properties.id",
            },
          },
          {
            id: "title",
            component: "TextBoxField",
            props: {
              defaultValue: "->$0Attr:properties.title",
            },
          },
          {
            id: "unique",
            component: "CheckBoxField",
            props: {
              defaultValue: "->$0Attr:properties.unique",
              skip: true
            },
          },
          {
            id: "required",
            component: "CheckBoxField",
            props: {
              defaultValue: "->$0Attr:properties.required",
              skip: true
            },
          },
          {
            id: "disabled",
            component: "CheckBoxField",
            props: {
              defaultValue: "->$0Attr:properties.disabled",
              skip: true
            },
          },
          {
            id: "Prop",
            title: "Property",
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
            title: "Property",
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
        title: "Collection",
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
        title: "Attribute",
        component: "TableField",
        tab: "Attribute",
        attributes: [
          {
            id: "Attr",
            title: "Attribute",
            component: "SelectBoxField",
            props: {
              displayExpr: "->$0Attr:properties.id",
              collection: "-$0-Coll$0->$0Attr",
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
            title: "Component",
            component: "SelectBoxField",
            props: {
              displayExpr: "properties.id",
              collection: "->$0Attr->$0Attr->$0DataType->$0Comp",
              defaultValue:
                "->$0Attr->$0Comp:properties.id||->$0Attr->$0Attr->$0Comp:properties.id",
            },
          },
          {
            id: "title",
            component: "TextBoxField",
            props: {
              defaultValue: "->$0Attr:properties.title||->$0Attr->$0Attr:properties.title",
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
            title: "Property",
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
        title: "Children",
        component: "TableField",
        tab: "Children",
        attributes: [
          {
            id: "Coll",
            title: "Collection",
            component: "SelectBoxField",
            props: {
              displayExpr: "->$0Coll:properties.id",
              collection: "-$0-Coll$0->$0Child",
              // displayExpr: "id",
              // collection: "-Coll$0->FormChild"
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
            title: "Attribute",
            component: "TableField",
            attributes: [
              {
                id: "Attr",
                title: "Attribute",
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
                title: "Component",
                component: "SelectBoxField",
                props: {
                  displayExpr: "properties.id",
                  collection: "->$0Attr->$0Attr->$0DataType->$0Comp",
                  defaultValue:
                    "->$0Attr->$0Comp:properties.id||->$0Attr->$0Attr->$0Comp:properties.id",
                },
              },
              {
                id: "title",
                component: "TextBoxField",
                props: {
                  defaultValue:
                    "->$0Attr:properties.title||->$0Attr->$0Attr:properties.title",
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
      {
        id: "Meta",
        component: "TableField",
        attributes: [
          { id: "column", component: "TextBoxField" },
          {
            id: "attr",
            title: "Mapping Attribute",
            component: "SelectBoxField",
            props: {
              displayExpr: "key",
              collection: "Attr",
            },
          },
          // {
          //  id: "column",
          //  component: "SelectBoxField",
          //  props: {
          //   displayExpr: "key",
          //   collection: "Update Dynamically on meta based on first row",
          //  },
          // },
          { id: "attrId", title: "Attribute ID", component: "TextBoxField" },
          {
            id: "coll",
            title: "Lookup Collection",
            component: "SelectBoxField",
            props: {
              displayExpr: "key",
              collection: "Coll",
            },
          },
          { id: "collLabel", title: "Lookup Label", component: "TextBoxField" },
          { id: "inward", component: "CheckBoxField" },
          {
            id: "collId",
            title: "Lookup Collection ID",
            component: "TextBoxField",
          },
          { id: "edge", title: "Edge Type", component: "TextBoxField" },
          {
            id: "func",
            title: "Function",
            component: "SelectBoxField",
            props: {
              stringValue: true,
              displayExpr: "key",
              collection: '[{"key":"dataType","id":"dataType"}, {"id": "lookup", "key": "lookup"}]',
            },
          },
          { id: "skip", component: "CheckBoxField" },
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
