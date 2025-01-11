import type { FieldAttribute, IFormMetaData } from "~/lib/meta/FormMetadataType";

import { PROPERTIES } from "~/components/styled/constants/constant";

import { pageAttr } from "./pageAttr";

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
          collection: "->$0Perm",
          componentName: "MultiSelect",
          hidden: true,
          key: "globalPerm",
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
      componentName: "TextInput",
      displayName: "Variant Name",
      key: "key",
    },
    {
      componentName: "Select",
      displayName: "Type",
      key: "type",
      
      options: `boolean
string
date
number`,
    },
    {
      attributes: [
        {
          componentName: "TextInput",
          displayName: "Property Name",
          key: "key",
        }, 
        {
          componentName: "TextInput",
          displayName: "Value",
          key: "value",
        },
      ],
      componentName: "DynamicTable",
      displayName: "Variants",
      key: "value",
    },
  ],
  componentName: "DynamicTable",
  key: "Variant",
  label: "Variant",
  type: "Variant",
} as FieldAttribute;