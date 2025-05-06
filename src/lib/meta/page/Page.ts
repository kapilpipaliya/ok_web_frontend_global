import type {
  FieldAttribute,
  IFormMetaData,
} from "~/lib/meta/FormMetadataType";
import { PROPERTIES } from "~/pages/settings/constants";

import {
  parentComponentAttribute,
  parentTemplateAttribute,
} from "../base/Comp";
import { pageAttr } from "./pageAttr";
import { css } from "~/lib/styles";

export const wrapWithTitle = (
  title: string,
  required: boolean,
  children: FieldAttribute,
) => {
  return {
    as: "div",
    attributes: [
      {
        as: "span",
        attributes: required
          ? [
              {
                as: "span",
                css: css`
  color: \${args.theme.var.color.error};
`,
                componentName: "Html",
                text: " *",
              },
            ]
          : [],
        css: css`
  flex: 0.5;
`,
        componentName: "Html",
        // key: `${title}`,
        text: title,
      },
      children,
    ],
    css: css`
  display: flex;
  align-items: center;
  gap: 2px;
  justify-content: space-between;
  margin-top: 6px;
`,
    componentName: "Html",
  };
};

export const Page: IFormMetaData = {
  attributes: [
    {
      as: "div",
      attributes: [
        {
          collection: "g:'File'",
          componentName: "Select",
          hide: true,
          key: "Preview",
          label: "File",
          labelKey: "::'P.fileName'",
          title: "Preview",
          // type: "Preview",
        },
        wrapWithTitle("Title", false, {
          css: [
            PROPERTIES.Css.TextFieldCss,
            css`
                flex: 1;
              `,
          ],
          componentName: "TextInput",
          key: "title",
          // onchange: '{"new": ["key","id"]}', // TODO: Fix this, it's not working with kobalte
        }),
        wrapWithTitle("Key", true, {
          css: [
            PROPERTIES.Css.TextFieldCss,
            css`
                flex: 1;
              `,
          ],
          componentName: "TextInput",
          key: "key",
          name: "Key",
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
          css: [
            PROPERTIES.Css.TextFieldCss,
            css`
                flex: 1;
              `,
          ],
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
        // wrapWithTitle("Public", false, {
        //   componentName: "CheckBox",
        //   hideInGrid: true,
        //   key: "public",
        // }),
        /*{ componentName: "CheckBox", key: "isRealTime" },
        {
          collection: "g:'Page'",
          componentName: "Select",
          displayName: "Collection",
          
            key: "coll",
            // inward: true,
            parentLabel: "Page",
          
        },
        {
          collection: `g:'{{->$0Coll::'P.key'}}'`,
          componentName: "Select",
            key: "data",
        },*/
        {
          attributes: pageAttr,
          componentName: "DynamicTable",
          hide: true,
          key: "Attr",
          label: "Attr",
          tab: "Attribute",
          type: "Attr",
        },
        {
          ...parentComponentAttribute,
          hide: true,
          hideInGrid: true,
          inward: true,
        },
        {
          ...parentTemplateAttribute,
          hide: true,
          hideInGrid: true,
          inward: true,
        },
        {
          collection: "->$0Perm",
          componentName: "MultiSelect",
          hide: true,
          hideInGrid: true,
          key: "globalPerm",
        },
        {
          collection: "->ChatHistory",
          componentName: "MultiSelect",
          hide: true,
          hideInGrid: true,
          key: "ChatHistory",
          label: "ChatHistory",
          type: "ChatHistory",
        },
      ],
      css: css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`,
      componentName: "Html",
    },
  ],
  key: "Page",
  title: "Page",
};

export const variantAttributes = {
  attributes: [
    {
      css: PROPERTIES.Css.TextFieldCss,
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
          css: `const type = 
              args.data?.P.type === "boolean" ? "CheckBox" : "TextInput";
            return type === "CheckBox"
              ? \`${PROPERTIES.Css.CheckBoxCss}\`
              : \`${PROPERTIES.Css.TextFieldCss}\`;`,
          props: `const type =
              args.data?.P.type === "boolean" ? "CheckBox" : "TextInput";
            return {
              componentName: type,
            };`,
        },
        {
          as: "button",
          attributes: [
            {
              componentName: "Html", as: "icon",
              icon: "ph:x",
              size: 16,
            },
          ],
          css: css`
  display: flex;
  align-items: center;
  gap: 2px;
  color: \${args.theme.var.color.error};
`,
          componentName: "Html",
          key: "button",
          props: `return {
              hide: () => {
                return (
                  args.data?.P.defValue === undefined ||
                  args.data?.P.defValue === null
                );
              },
              onClick: () => {
                args.mergeVertexProperties(
                  args.txnId,
                  args.data?.id,
                  args.graph,
                  args.setGraph,
                  {
                    defValue: null,
                  },
                );
              },
            };`,
          type: "button",
        },
      ],
      css: css`
  display: flex;
  align-items: center;
  gap: 2px;
`,
      componentName: "Html",
      displayName: "Default Value",
    },
    // {
    //   // componentName: "::'P.type'",
    //   props: (options: FunctionArgumentType) => {
    //     return {
    //       componentName: options.data?.P.type === "boolean" ? "CheckBox" : "TextInput"
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
          props: `const type = args.evalExpression("<-$0::'P.type'", {
              graph: args.graph,
              setGraph: args.setGraph,
              vertexes: [args.data],
            });
            return {
              componentName: type === "boolean" ? "CheckBox" : "TextInput",
            };`,
        },
      ],
      componentName: "DynamicTable",
      displayName: "Variants",
      key: "option",
    },
  ],
  componentName: "DynamicTable",
  key: "Variant",
  hide: true,
  // label: "Variant",
  // type: "Variant",
} as FieldAttribute;
