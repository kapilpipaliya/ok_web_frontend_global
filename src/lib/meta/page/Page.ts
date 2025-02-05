import type { FieldAttribute, IFormMetaData } from "~/lib/meta/FormMetadataType";

import { PROPERTIES } from "~/components/styled/constants/constant";

import { pageAttr } from "./pageAttr";
import { FunctionArgumentType } from "~/components/form/FieldSchemaType";
import { evalExpression } from "~/lib/expression_eval";
import { parentComponentAttribute, parentTemplateAttribute } from "../base/Comp";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

export const wrapWithTitle = (title: string, required: boolean, children: any) => {
  return {
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
    as: "div",
    key: "box1"
  }
};

export const Page: IFormMetaData = {
  attributes: [
    {
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
      ],
      class: "d:flex flex:col gap:8",
      componentName: "Box",
      as: "div",
      key: "box",
    },
  ],
  key: "Page",
  title: "Page",
};


export const variantAttributes =  {
  attributes: [
    {
      componentName: "TextInput",
      class: PROPERTIES.Css.TextField,
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
      componentName: "Box",
      as: "div",
      displayName: "Default Value",
      class: "flex ai:center gap:2",
      attributes: [
        {
          // componentName: "::'P.type'",
          otherProps: (options: FunctionArgumentType) => {
            const type = options.data.P.type === "boolean" ? "CheckBox" : "TextInput";
            return {
              class: type === "CheckBox" ? PROPERTIES.Css.CheckBox : PROPERTIES.Css.TextField,
              componentName: type,
            }
          },
          displayName: "Default Value",
          key: "defValue",
        },
        {
          componentName: "Button",
          class: "flex ai:center gap:2 color:red",
          key: "button",
          otherProps: (options: FunctionArgumentType) => {
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
          },
          attributes: [
            {
              componentName: "Icon",
              icon: "ph:x",
              size: 16,
            }
          ]
        }
      ]
    },
    // {
    //   // componentName: "::'P.type'",
    //   otherProps: (options: FunctionArgumentType) => {
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
          otherProps: (options: FunctionArgumentType) => {
            const type = evalExpression("<-$0::'P.type'", {
              graph: options.graph,
              setGraph: options.setGraph,
              vertexes: [options.data]
            });
            return {
              componentName: type === "boolean" ? "CheckBox" : "TextInput"
            };
          },
          displayName: "Value",
          key: "value",
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