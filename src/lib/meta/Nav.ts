import type { IFormContext } from "~/lib/contexts";
import { findVertexByLabelAndUniqueIdWithSkip } from "~/lib/graph/get/sync/findVertex";
import { useGraph } from "../graph/graph";

export const Nav = {
  attributes: [
    {
      component: "TextBox",
      name: "title",

      onchange: '{"new": ["name","id"]}',
    },
    {
      component: "TextBox",
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
            const { formData } = (options.validator.context as IFormContext) ||
              ({} as IFormContext);
            const [graph, setGraph] = useGraph();

            const val = options.value;
            return !findVertexByLabelAndUniqueIdWithSkip(
              "Navigation",
              "id",
              val,
              formData.id,
              graph
            );
          },
        },
      ],
    },
    { component: "TextArea", name: "description" },
    {
      attributes: [
        {
          component: "TextBox",
          displayName: "ID",
          name: "name",
        },
        {
          component: "TextArea",
          name: "definition",
        },
        {
          component: "CheckBox",
          name: "expanded",
        },
        {
          component: "SelectBox",
          items: `Table
Form
Url`,

          name: "func",
        },
        {
          collection: "g:'Form'",
          component: "SelectBox",

          name: "Form",
        },
        {
          component: "TextBox",
          name: "url",
        },
        {
          attributes: [
            {
              collection: "g:'Role'",
              component: "SelectBox",

              name: "role",
            },
            {
              attributes: [
                {
                  collection: "g:'Perm'",
                  component: "SelectBox",

                  name: "perm",
                },
              ],
              component: "DynamicTable",
              name: "Perm",
            },
          ],
          component: "DynamicTable",
          name: "Role",
          tab: "Permission",
        },
        {
          attributes: [
            {
              component: "TextBox",
              displayName: "ID",
              name: "name",
            },
            {
              component: "TextArea",
              name: "definition",
            },
            {
              component: "CheckBox",
              name: "expanded",
            },
            {
              component: "SelectBox",
              items: `Table
Form
Url`,

              name: "func",
            },
            {
              collection: "g:'Form'",
              component: "SelectBox",

              name: "Form",
            },
            {
              component: "TextBox",
              name: "url",
            },
            {
              attributes: [
                {
                  collection: "g:'Role'",
                  component: "SelectBox",

                  name: "role",
                },
                {
                  attributes: [
                    {
                      collection: "g:'Perm'",
                      component: "SelectBox",

                      name: "perm",
                    },
                  ],
                  component: "DynamicTable",
                  name: "Perm",
                },
              ],
              component: "DynamicTable",
              name: "Role",
              tab: "Permission",
            },
            {
              attributes: [
                {
                  component: "TextBox",
                  displayName: "ID",
                  name: "name",
                },
                {
                  component: "TextArea",
                  name: "definition",
                },
                {
                  component: "CheckBox",
                  name: "expanded",
                },
                {
                  component: "SelectBox",
                  items: `Table
Form
Url`,

                  name: "func",
                },
                {
                  collection: "g:'Form'",
                  component: "SelectBox",

                  name: "Form",
                },
                {
                  component: "TextBox",
                  name: "url",
                },
                {
                  attributes: [
                    {
                      collection: "g:'Role'",
                      component: "SelectBox",

                      name: "role",
                    },
                    {
                      attributes: [
                        {
                          collection: "g:'Perm'",
                          component: "SelectBox",

                          name: "perm",
                        },
                      ],
                      component: "DynamicTable",
                      name: "Perm",
                    },
                  ],
                  component: "DynamicTable",
                  name: "Role",
                  tab: "Permission",
                },
                {
                  attributes: [
                    {
                      component: "TextBox",
                      displayName: "ID",
                      name: "name",
                    },
                    {
                      component: "TextArea",
                      name: "definition",
                    },
                    {
                      component: "CheckBox",
                      name: "expanded",
                    },
                    {
                      component: "SelectBox",
                      items: `Table
Form
Url`,

                      name: "func",
                    },
                    {
                      collection: "g:'Form'",
                      component: "SelectBox",

                      name: "Form",
                    },
                    {
                      component: "TextBox",
                      name: "url",
                    },
                    {
                      attributes: [
                        {
                          collection: "g:'Role'",
                          component: "SelectBox",

                          name: "role",
                        },
                        {
                          attributes: [
                            {
                              collection: "g:'Perm'",
                              component: "SelectBox",

                              name: "perm",
                            },
                          ],
                          component: "DynamicTable",
                          name: "Perm",
                        },
                      ],
                      component: "DynamicTable",
                      name: "Role",
                      tab: "Permission",
                    },
                  ],
                  component: "DynamicTable",
                  name: "Attr",

                  tab: "expand",

                  type: "NavAttr",
                },
              ],
              component: "DynamicTable",
              name: "Attr",

              tab: "expand",

              type: "NavAttr",
            },
          ],
          component: "DynamicTable",
          name: "Attr",

          tab: "expand",

          type: "NavAttr",
        },
      ],
      component: "DynamicTable",
      name: "Attr",

      tab: "Attributes",

      type: "NavAttr",
    },
  ],
  name: "Nav",
  title: "Navigation",
};
