import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";
import type { FieldAttribute, IFormMetaData } from "~/lib/meta/FormMetadataType";

import { PROPERTIES } from "~/components/styled/constants/constant";
import { evalExpression } from "~/lib/expression_eval";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

import { parentComponentAttribute, parentTemplateAttribute } from "../base/Comp";
import { pageAttr } from "./pageAttr";

export const wrapWithTitle = (title: string, required: boolean, children: any) => {
  return {
    as: "div",
    attributes: [
      {
        attributes: required ? [{
          class: "color:red",
          componentName: "Text",
          key: `required_${title}`,
          text: " *",
        }] : [],
        class: "flex:.5",
        componentName: "Text",
        key: `title_${title}`,
        text: title
      },
      children,
    ],
    class: "flex ai:center gap:2 justify-content:space-between mt:6",
    componentName: "Box",
    key: "box1"
  }
};

export const Page: IFormMetaData = {
  attributes: [
    {
      as: "div",
      attributes: [
        wrapWithTitle("Title", false, {
              class: `${PROPERTIES.Css.TextField} flex:1`,
              componentName: "TextInput",
              key: "title",
              // onchange: '{"new": ["key","id"]}', // TODO: Fix this, it's not working with kobalte
            }),
        wrapWithTitle("Key", true, {
          class: `${PROPERTIES.Css.TextField} flex:1`,
          componentName: "TextInput",
          key: "key",
          validation: { required: true },

          validationRules: [
            {
              message: "ID is required",
              type: "required",
            },
            {
              ignoreEmptyValue: true,
              message: "This ID is already taken",
              type: "custom",
              // validationCallback: (options: any) => {
              //   const { formData } =
              //     (options.validator.context as FormContext) ||
              //     ({} as FormContext);
              //   const [graph, _setGraph] = useGraph();
              //   const val = options.value;
              //   return !findVertexByLabelAndUniqueIdWithSkip(
              //     "Page",
              //     "id",
              //     val,
              //     formData.id,
              //     graph,
              //   );
              // },
            },
          ],
        }),
        wrapWithTitle("Description", false, {
          class: `${PROPERTIES.Css.TextField} flex:1`,
          componentName: "TextArea",
          key: "description",
        }),
        // {
        //   collection: "g:'Dashboard'",
        //   componentName: "MultiSelect",
        //   inward: true,
        //   key: "dashboard",
        //   parentLabel: "Dashboard",
        // },
        wrapWithTitle("Public", false, {
          componentName: "CheckBox",
          key: "public",
        }),
        /*{ componentName: "CheckBox", key: "isRealTime" },
        {
          collection: "g:'Form'",
          componentName: "Select",
          displayName: "Collection",
          
            key: "coll",
            // inward: true,
            parentLabel: "Form",
          
        },
        {
          collection: `g:'{{->$0Coll::'P.key'}}'`,
          componentName: "Select",
            key: "data",
        },*/
        {
          attributes: pageAttr,
          componentName: "DynamicTable",
          hidden: true,
          key: "Attr",
          label: "Attr",
          tab: "Attribute",
          type: "Attr",
        },
        {
          ...parentComponentAttribute,
          inward: true,
        },
        {
          ...parentTemplateAttribute,
          inward: true,
        },
        {
          collection: "->$0Perm",
          componentName: "MultiSelect",
          hidden: true,
          key: "globalPerm",
        },
        {
          collection: "->ChatHistory",
          componentName: "MultiSelect",
          hidden: true,
          key: "ChatHistory",
          label: "ChatHistory",
          type: "ChatHistory",
        },
        {
          collection: "g:'File'",
          componentName: "Select",
          // hidden: true,
          key: "Preview",
          label: "File",
          labelKey: "::'P.fileName'",
          // type: "Preview",
        },
      ],
      class: "d:flex flex:col gap:8",
      componentName: "Box",
      key: "box",
    },
  ],
  key: "Page",
  title: "Page",
};


export const variantAttributes =  {
  attributes: [
    {
      class: PROPERTIES.Css.TextField,
      componentName: "TextInput",
      displayName: "Variant Name",
      key: "key",
    },
    {
      componentName: "Select",
      displayName: "Type",
      key: "type",
      
      options: `boolean
string`,
// date
// number
    },
    {
      as: "div",
      attributes: [
        {
          displayName: "Default Value",
          key: "defValue",
          // componentName: "::'P.type'",
          props: (options: FunctionArgumentType) => {
            const type = options.data.P.type === "boolean" ? "CheckBox" : "TextInput";
            return {
              class: type === "CheckBox" ? PROPERTIES.Css.CheckBox : PROPERTIES.Css.TextField,
              componentName: type,
            }
          },
        },
        {
          attributes: [
            {
              componentName: "Icon",
              icon: "ph:x",
              size: 16,
            }
          ],
          class: "flex ai:center gap:2 color:red",
          componentName: "Button",
          key: "button",
          props: (options: FunctionArgumentType) => {
            return {
              hidden: (options: FunctionArgumentType) => {
                return options.data.P.defValue === undefined || options.data.P.defValue === null;
              },
              onClick: () => {
                mergeVertexProperties(options.txnId, options.data.id, options.graph, options.setGraph, {
                  defValue: null
                })
              }
            }
          }
        }
      ],
      class: "flex ai:center gap:2",
      componentName: "Box",
      displayName: "Default Value"
    },
    // {
    //   // componentName: "::'P.type'",
    //   props: (options: FunctionArgumentType) => {
    //     return {
    //       componentName: options.data.P.type === "boolean" ? "CheckBox" : "TextInput"
    //     }
    //   },
    //   displayName: "Value",
    //   key: "value",
    // },
    {
      attributes: [
        {
          componentName: "TextInput",
          displayName: "Property Name",
          key: "key",
        }, 
        {
          displayName: "Value",
          key: "value",
          props: (options: FunctionArgumentType) => {
            const type = evalExpression("<-$0::'P.type'", {
              graph: options.graph,
              setGraph: options.setGraph,
              vertexes: [options.data]
            });
            return {
              componentName: type === "boolean" ? "CheckBox" : "TextInput"
            };
          },
        },
      ],
      componentName: "DynamicTable",
      displayName: "Variants",
      key: "option",
    },
  ],
  componentName: "DynamicTable",
  key: "Variant",
  // label: "Variant",
  // type: "Variant",
} as FieldAttribute;