import type { FormContext } from "~/components/form/FormContext";
import { textFieldInputMeta, textFieldTextAreaMeta } from "~/components/constants/textFieldInput";
import { findVertexByLabelAndUniqueIdWithSkip } from "~/lib/graph/get/sync/findVertex";

import { useGraph } from "../../graph/graph";

export const Nav = {
  attributes: [
    {
      componentName: "TextField",
      name: "title",
      attributes: [
        textFieldInputMeta
      ],
      onchange: '{"new": ["name","id"]}',
    },
    {
      componentName: "TextField",
      name: "name",
      attributes: [
        textFieldInputMeta
      ],
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
            const [graph, _setGraph] = useGraph();

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
    { 
      componentName: "TextField", 
      name: "description",
      attributes: [
        textFieldTextAreaMeta
      ]
    },
    {
      attributes: [
        {
          componentName: "TextField",
          displayName: "ID",
          name: "name",
          attributes: [
            textFieldInputMeta
          ],
        },
        {
          componentName: "TextField",
          name: "definition",
          attributes: [
            textFieldTextAreaMeta
          ]
        },
        {
          componentName: "CheckBox",
          name: "expanded",
        },
        {
          componentName: "SelectBox",
          items: `Table
Form
Url`,

          name: "func",
        },
        {
          collection: "g:'Form'",
          componentName: "SelectBox",

          name: "Form",
        },
        {
          componentName: "TextField",
          name: "url",
          attributes: [
            textFieldInputMeta
          ],
        },
        {
          attributes: [
            {
              collection: "g:'Role'",
              componentName: "SelectBox",

              name: "role",
            },
            {
              attributes: [
                {
                  collection: "g:'Perm'",
                  componentName: "SelectBox",

                  name: "perm",
                },
              ],
              componentName: "DynamicTable",
              name: "Perm",
            },
          ],
          componentName: "DynamicTable",
          name: "Role",
          tab: "Permission",
        },
        {
          attributes: [
            {
              componentName: "TextField",
              displayName: "ID",
              name: "name",
              attributes: [
                textFieldInputMeta
              ],
            },
            {
              componentName: "TextField",
              name: "definition",
              attributes: [
                textFieldTextAreaMeta
              ]
            },
            {
              componentName: "CheckBox",
              name: "expanded",
            },
            {
              componentName: "SelectBox",
              items: `Table
Form
Url`,

              name: "func",
            },
            {
              collection: "g:'Form'",
              componentName: "SelectBox",

              name: "Form",
            },
            {
              componentName: "TextField",
              name: "url",
              attributes: [
                textFieldInputMeta
              ],
            },
            {
              attributes: [
                {
                  collection: "g:'Role'",
                  componentName: "SelectBox",

                  name: "role",
                },
                {
                  attributes: [
                    {
                      collection: "g:'Perm'",
                      componentName: "SelectBox",

                      name: "perm",
                    },
                  ],
                  componentName: "DynamicTable",
                  name: "Perm",
                },
              ],
              componentName: "DynamicTable",
              name: "Role",
              tab: "Permission",
            },
            {
              attributes: [
                {
                  componentName: "TextField",
                  displayName: "ID",
                  name: "name",
                  attributes: [
                    textFieldInputMeta
                  ],
                },
                {
                  componentName: "TextField",
                  name: "definition",
                  attributes: [
                    textFieldTextAreaMeta
                  ]
                },
                {
                  componentName: "CheckBox",
                  name: "expanded",
                },
                {
                  componentName: "SelectBox",
                  items: `Table
Form
Url`,

                  name: "func",
                },
                {
                  collection: "g:'Form'",
                  componentName: "SelectBox",

                  name: "Form",
                },
                {
                  componentName: "TextField",
                  name: "url",
                  attributes: [
                    textFieldInputMeta
                  ],
                },
                {
                  attributes: [
                    {
                      collection: "g:'Role'",
                      componentName: "SelectBox",

                      name: "role",
                    },
                    {
                      attributes: [
                        {
                          collection: "g:'Perm'",
                          componentName: "SelectBox",

                          name: "perm",
                        },
                      ],
                      componentName: "DynamicTable",
                      name: "Perm",
                    },
                  ],
                  componentName: "DynamicTable",
                  name: "Role",
                  tab: "Permission",
                },
                {
                  attributes: [
                    {
                      componentName: "TextField",
                      displayName: "ID",
                      name: "name",
                      attributes: [
                        textFieldInputMeta
                      ],
                    },
                    {
                      componentName: "TextField",
                      name: "definition",
                      attributes: [
                        textFieldTextAreaMeta
                      ]
                    },
                    {
                      componentName: "CheckBox",
                      name: "expanded",
                    },
                    {
                      componentName: "SelectBox",
                      items: `Table
Form
Url`,

                      name: "func",
                    },
                    {
                      collection: "g:'Form'",
                      componentName: "SelectBox",

                      name: "Form",
                    },
                    {
                      componentName: "TextField",
                      name: "url",
                      attributes: [
                        textFieldInputMeta
                      ],
                    },
                    {
                      attributes: [
                        {
                          collection: "g:'Role'",
                          componentName: "SelectBox",

                          name: "role",
                        },
                        {
                          attributes: [
                            {
                              collection: "g:'Perm'",
                              componentName: "SelectBox",

                              name: "perm",
                            },
                          ],
                          componentName: "DynamicTable",
                          name: "Perm",
                        },
                      ],
                      componentName: "DynamicTable",
                      name: "Role",
                      tab: "Permission",
                    },
                  ],
                  componentName: "DynamicTable",
                  name: "Attr",

                  tab: "expand",

                  type: "NavAttr",
                },
              ],
              componentName: "DynamicTable",
              name: "Attr",

              tab: "expand",

              type: "NavAttr",
            },
          ],
          componentName: "DynamicTable",
          name: "Attr",

          tab: "expand",

          type: "NavAttr",
        },
      ],
      componentName: "DynamicTable",
      name: "Attr",

      tab: "Attributes",

      type: "NavAttr",
    },
  ],
  name: "Nav",
  title: "Navigation",
};
