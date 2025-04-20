import { useSearchParams } from "@solidjs/router";
import { type Component, createEffect, createSignal } from "solid-js";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { HeaderWithDescription } from "~/components/styled/HeaderWithDescription";
import { isAdminRole } from "~/lib/graph/get/sync/auth/isAdminRole";
import { useGraph } from "~/lib/graph/GraphContext";
import { SchemaRenderer } from "~/pages/SchemaRenderer";
import { STYLES } from "~/pages/settings/constants";
import { css } from "~/lib/styles";

export interface MenuItem {
  adminOnly?: boolean;
  component: Component;
  group?: string;
  id: string;
  label: string;
}

interface SettingsLayoutProps {
  description: string;
  menuItems: MenuItem[];
  title: string;
}

export function SettingsLayout(props: SettingsLayoutProps) {
  const [graph] = useGraph();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMenu, setSelectedMenu] = createSignal(
    (searchParams.tab as string) || props.menuItems[0]?.id || "",
  );

  createEffect(() => {
    const tab = searchParams.tab;
    if (tab !== selectedMenu()) {
      setSelectedMenu(
        typeof tab === "string" ? tab : props.menuItems[0]?.id || "",
      );
    }
  });

  const handleMenuSelect = (id: string) => {
    setSearchParams({ tab: id });
  };

  const groupedMenuItems = () => {
    const groups: Record<string, MenuItem[]> = {};
    props.menuItems.forEach((item) => {
      const group = item.group || "default";
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
    });
    return groups;
  };

  type DataType = [string, MenuItem[]];

  // Create a schema for the SettingsLayout
  const settingsLayoutSchema: IFormMetaData = {
    attributes: [
      {
        as: "div",
        attributes: [
          {
            componentName: "Title",
            props: () => ({
              text: `${props.title} - ${props.menuItems.find((item) => item.id === selectedMenu())?.label}`,
            }),
          },
          {
            css: css`
  flex: 1;
`,
            // @ts-expect-error - HeaderWithDescription is a function component
            componentName: HeaderWithDescription,
            props: () => ({
              description: props.description,
              title: props.title,
            }),
          },
          {
            as: "div",
            attributes: [
              {
                as: "div",
                attributes: [
                  {
                    attributes: [
                      {
                        as: "div",
                        attributes: [
                          {
                            as: "",
                            attributes: [
                              {
                                as: "div",
                                css: css`
  font-size: 14px;
  color: #6B7280;
  font-weight: 500;
  margin-bottom: 8px;
`,
                                componentName: "Html",
                                props: (args: FunctionArgumentType) => ({
                                  text: (
                                    args.dataContext.menuGroups as DataType
                                  )[0],
                                }),
                              },
                            ],
                            componentName: "Html",
                            props: (args: FunctionArgumentType) => ({
                              hide:
                                (args.dataContext.menuGroups as DataType)[0] ===
                                "default",
                            }),
                          },
                          {
                            attributes: [
                              {
                                as: "div",
                                componentName: "Html",
                                css: args => css`
                                padding: 12px;
                                cursor: pointer;
                                border-radius: 4px;
                                margin-bottom: 8px;
                                ${
                                  selectedMenu() ===
                                  (args.dataContext.menuItems as MenuItem).id
                                    ? `
                                      background-color: ${args.theme.var.color.primary};
                                      color: ${args.theme.var.color.base_10};
                                    `
                                    : `
                                      color: ${args.theme.var.color.base_820};
                                      &:hover {
                                        background-color: ${args.theme.var.color.primary_20};
                                      }
                                    `
                                }
                              `,
                                props: (args: FunctionArgumentType) => ({
                                  hide:
                                    (args.dataContext.menuItems as MenuItem)
                                      .adminOnly && !isAdminRole(graph),
                                  onClick: () =>
                                    handleMenuSelect(
                                      (args.dataContext.menuItems as MenuItem)
                                        .id,
                                    ),
                                  text: (args.dataContext.menuItems as MenuItem)
                                    .label,
                                }),
                              },
                            ],
                            componentName: "Data",
                            loop: true,
                            name: "menuItems",
                            props: (args: FunctionArgumentType) => ({
                              data: (
                                args.dataContext.menuGroups as DataType
                              )[1],
                            }),
                          },
                        ],
                        css: css`
  margin-bottom: 16px;
`,
                        componentName: "Html",
                        props: (args: FunctionArgumentType) => ({
                          show: (
                            args.dataContext.menuGroups as DataType
                          )[1].some(
                            (item: MenuItem) =>
                              !item.adminOnly || isAdminRole(graph),
                          ),
                        }),
                      },
                    ],
                    componentName: "Data",
                    name: "menuGroups",
                    props: () => ({
                      data: Object.entries(groupedMenuItems()),
                      loop: true,
                    }),
                  },
                ],
                css: [STYLES.overflowCss, css`
  height:calc(100vh - 140px);
  border-right:1px solid #eee;
`],
                componentName: "Html",
              },
              {
                as: "div",
                attributes: [
                  {
                    componentName: "Html",
                    props: () => ({
                      componentName: props.menuItems.find(
                        (item) => item.id === selectedMenu(),
                      )?.component,
                    }),
                  },
                ],
                css: css`
  flex: 1;
  padding: 6px;
`,
                componentName: "Html",
              },
            ],
            css: css`
  display: grid;
  grid-template-columns: 250px 1fr;
  padding: 6px;
`,
            componentName: "Html",
          },
        ],
        componentName: "Html",
      },
    ],
    key: "settingsLayout",
  };

  return <SchemaRenderer form={settingsLayoutSchema} />;
}
