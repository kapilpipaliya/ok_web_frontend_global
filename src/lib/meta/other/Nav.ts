import type { IFormContext } from "~/components/form/FormContext";

import { findVertexByLabelAndUniqueIdWithSkip } from "~/lib/graph/get/sync/findVertex";

import { useGraph } from "../../graph/graph";

export const Nav = {
  attributes: [
    {
      componentName: "TextBox",
      name: "title",

      onchange: '{"new": ["name","id"]}',
    },
    {
      componentName: "TextBox",
      name: "name",

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
    { componentName: "TextArea", name: "description" },
    {
      attributes: [
        {
          componentName: "TextBox",
          displayName: "ID",
          name: "name",
        },
        {
          componentName: "TextArea",
          name: "definition",
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
          componentName: "TextBox",
          name: "url",
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
              componentName: "TextBox",
              displayName: "ID",
              name: "name",
            },
            {
              componentName: "TextArea",
              name: "definition",
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
              componentName: "TextBox",
              name: "url",
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
                  componentName: "TextBox",
                  displayName: "ID",
                  name: "name",
                },
                {
                  componentName: "TextArea",
                  name: "definition",
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
                  componentName: "TextBox",
                  name: "url",
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
                      componentName: "TextBox",
                      displayName: "ID",
                      name: "name",
                    },
                    {
                      componentName: "TextArea",
                      name: "definition",
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
                      componentName: "TextBox",
                      name: "url",
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
