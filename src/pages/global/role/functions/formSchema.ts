import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { MutationResult } from "~/cypher/types/MutationArgs";
import type { Vertex } from "~/lib/graph/graph";
import type {
  FieldAttribute,
  IFormMetaData,
} from "~/lib/meta/FormMetadataType";

import { useToast } from "~/components/styled/modal/Toast";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { evalExpression } from "~/lib/expression_eval";
import { onMutatDataGet } from "~/lib/graph/mutate/data/onMutatDataGet";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { PROPERTIES, SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { addEditButtonSchema } from "~/pages/subdomain/functions/addEditButtonSchema";

import { loadingIconSchema } from "../../../../lib/schema/loadingIconSchema";
import { css } from "~/lib/styles";

export const permissionsTableSchema = (label: string) =>
  ({
    attributes: [
      {
        collection: `g:'${label}'`,
        componentName: "Select",
        key: label,
      },
      {
        componentName: "Select",
        displayName: "Access Level",
        key: "access",
        options: `NONE
VIEW
CREATE
EDIT
FULL`,
      },
      // {
      //   componentName: "TextInput",
      //   key: "scope",
      // },
    ],
    componentName: "DynamicTable",
    key: label,
  }) as FieldAttribute;

export const roleFormSchema = {
  as: "div",
  attributes: [
    loadingIconSchema(),
    {
      as: "div",
      attributes: [
        {
          as: "div",
          attributes: [
            {
              as: "span",
              css: SETTINGS_CONSTANTS.LABEL_CSS,
              componentName: "Html",
              text: "Name",
              validation: { required: true },
            },
            {
              css: PROPERTIES.Css.TextFieldCss,
              componentName: "TextInput",
              key: "key",
              placeholder: "Enter role name",
              props: (options: FunctionArgumentType) => ({
                disabled:
                  !options.data?.id.startsWith("-") &&
                  // TODO: fix, after rename to Admin, the field is disabled.
                  Object.values(SYSTEM_ROLES).includes(options.data?.P.key),
              }),
              validation: { required: true },
            },
          ],
          css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
          componentName: "Html",
        },
        {
          as: "div",
          attributes: [
            {
              as: "span",
              css: SETTINGS_CONSTANTS.LABEL_CSS,
              componentName: "Html",
              text: "Description",
            },
            {
              css: PROPERTIES.Css.TextFieldCss,
              componentName: "TextInput",
              key: "description",
              placeholder: "Enter role description",
            },
          ],
          css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
          componentName: "Html",
        },
      ],
      css: SETTINGS_CONSTANTS.FORM_CSS,
      componentName: "Html",
    },
    {
      attributes: [
        {
          as: "div",
          attributes: [
            {
              as: "button",
              componentName: "Html",
              css: (args: FunctionArgumentType) => {
                return [
                  css`
                cursor: pointer;
                padding: 8px 16px;
                background-color: transparent;
                border-left: none;
                border-right: none;
                border-top: none;
                `,
                  args.contextData.tabState[0]?.activeTab === "Perm"
                    ? css`border-bottom: 2px solid ${args.theme.var.color.primary};`
                    : css`border-bottom: 2px solid transparent;`,
                ];
              },
              props: (options: FunctionArgumentType) => {
                const permissions = evalExpression("->RolePerm", {
                  graph: options.graph,
                  setGraph: options.setGraph,
                  vertexes: [options.data],
                });
                return {
                  onClick: () =>
                    options.contextData.tabState[1]("activeTab", "Perm"),
                  text: `Permissions ${options.contextData.modalState[0]?.isLoading ? "" : `(${(permissions || []).length})`}`,
                };
              },
              type: "button",
            },
            {
              as: "button",
              componentName: "Html",
              css: (options: FunctionArgumentType) => [
                css`
                cursor: pointer;
                padding: 8px 16px;
                background-color: transparent;
                border-left: none;
                border-right: none;
                border-top: none;
              `,
                options.contextData.tabState[0]?.activeTab === "Page"
                  ? css`border-bottom: 2px solid ${options.theme.var.color.primary};`
                  : css`border-bottom: 2px solid transparent;`,
              ],
              props: (options: FunctionArgumentType) => {
                const permissions = evalExpression("->RolePage", {
                  graph: options.graph,
                  setGraph: options.setGraph,
                  vertexes: [options.data],
                });
                return {
                  onClick: () =>
                    options.contextData.tabState[1]("activeTab", "Page"),
                  text: `Pages ${options.contextData.modalState[0]?.isLoading ? "" : `(${(permissions || []).length})`}`,
                };
              },
              type: "button",
            },
            {
              as: "button",
              componentName: "Html",
              css: (options: FunctionArgumentType) => [
                css`
                cursor: pointer;
                padding: 8px 16px;
                background-color: transparent;
                border-left: none;
                border-right: none;
                border-top: none;
              `,
                options.contextData.tabState[0]?.activeTab === "Form"
                  ? css`border-bottom: 2px solid ${options.theme.var.color.primary};`
                  : css`border-bottom: 2px solid transparent;`,
              ],
              props: (options: FunctionArgumentType) => {
                const permissions = evalExpression("->RoleForm", {
                  graph: options.graph,
                  setGraph: options.setGraph,
                  vertexes: [options.data],
                });
                return {
                  onClick: () =>
                    options.contextData.tabState[1]("activeTab", "Form"),
                  text: `Forms ${options.contextData.modalState[0]?.isLoading ? "" : `(${(permissions || []).length})`}`,
                };
              },
              type: "button",
            },
          ],
          css: css`
  display: flex;
  border-bottom: 1px solid \${args.theme.var.color.base_40};
`,
          componentName: "Html",
        },
        {
          as: "div",
          attributes: [
            {
              as: "div",
              attributes: [permissionsTableSchema("Perm")],
              componentName: "Html",
              css: (options: FunctionArgumentType) =>
                options.contextData.tabState[0]?.activeTab === "Perm"
                  ? ""
                  : css`display:none`,
            },
            {
              as: "div",
              attributes: [permissionsTableSchema("Page")],
              componentName: "Html",
              css: (options: FunctionArgumentType) =>
                options.contextData.tabState[0]?.activeTab === "Page"
                  ? ""
                  : css`display:none`,
            },

            {
              as: "div",
              attributes: [permissionsTableSchema("Form")],
              componentName: "Html",
              css: (options: FunctionArgumentType) =>
                options.contextData.tabState[0]?.activeTab === "Form"
                  ? ""
                  : css`display:none`,
            },
          ],
          css: css`
  margin-top: 16px;
  padding: 8px;
`,
          componentName: "Html",
        },
      ],
      componentName: "Data",
      name: "tabState",

      props: () => ({
        data: createStore({
          activeTab: "Perm",
        }),
      }),
    },
  ],
  componentName: "Html",
  props: (options: FunctionArgumentType) => {
    return {
      onMount: async () => {
        if (!options.data?.id.startsWith("-")) {
          try {
            options.contextData.modalState[1]("isLoading", true);
            const response = await postAPI(API.role.getRoleUrl, {
              id: options.data?.id,
            });
            if (response.error) {
              throw new Error(response.error);
            }
            options.setGraphData(0, response.graph, {});
          } catch (error) {
            options.showErrorToast((error as Error).message);
          } finally {
            options.contextData.modalState[1]("isLoading", false);
          }
        }
      },
    };
  },
};

export const getRoleFormSchema = (onSuccess: () => void) => {
  const { showErrorToast, showSuccessToast } = useToast();

  const validateForm = (formData: Vertex) => {
    if (!formData.P.key?.trim()) {
      showErrorToast("Please enter role name");
      return false;
    }
    return true;
  };

  const handleSave = async (options: FunctionArgumentType) => {
    const formData = options.data;
    if (!validateForm(formData)) {
      return;
    }

    try {
      options.contextData.modalState[1]("isLoading", true);
      const data = commitTxn(options.txnId, options.graph);
      if (!data) {
        return;
      }
      const response = await postAPI(API.role.upsertRoleUrl, {
        data,
        role: formData,
      });

      if (response.error) {
        showErrorToast(response.error);
      } else {
        onMutatDataGet(
          options.graph,
          options.setGraph,
          response as MutationResult,
        );
        options.removeTxnIdAndCreateNew(options.txnId);
        options.ensureData();
        showSuccessToast("Role created successfully");
        options.contextData.modalState[1]("showModal", false);
        onSuccess();
      }
    } catch (error) {
      showErrorToast((error as Error).message);
    } finally {
      options.contextData.modalState[1]("isLoading", false);
    }
  };

  // Modal schemas similar to SubDomainForm
  const modalHeaderSchema = {
    as: "div",
    attributes: [
      {
        as: "span",
        css: SETTINGS_CONSTANTS.MODAL.HEADER.TEXT_CSS,
        componentName: "Html",
        text: "Add New Role",
      },
    ],
    css: SETTINGS_CONSTANTS.MODAL.HEADER.CSS,
    componentName: "Html",
  };

  const modalFooterSchema = {
    as: "div",
    attributes: [
      {
        as: "button",
        css: SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CSS,
        componentName: "Html",
        props: (options: FunctionArgumentType) => ({
          disabled: options.contextData.modalState[0]?.isLoading,
          onClick: () => handleSave(options),
          text: options.contextData.modalState[0]?.isLoading
            ? "Saving..."
            : "Save",
        }),
        type: "button",
      },
      {
        as: "button",
        css: SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CSS,
        componentName: "Html",
        props: (options: FunctionArgumentType) => ({
          onClick: () => {
            options.contextData.modalState[1]("showModal", false);
            options.revertTransactionUpToIndex(options.txnId, -1);
            options.ensureData();
          },
          text: "Cancel",
        }),
        type: "button",
      },
    ],
    css: SETTINGS_CONSTANTS.MODAL.FOOTER.CSS,
    componentName: "Html",
  };

  const schema = {
    attributes: [
      {
        as: "div",
        attributes: [
          addEditButtonSchema("Role"),
          {
            as: "div",
            attributes: [],
            css: SETTINGS_CONSTANTS.MODAL.OVERLAY_CSS,
            componentName: "Html",
            props: (options: FunctionArgumentType) => ({
              hide: !options.contextData.modalState[0]?.showModal,
            }),
          },
          {
            attributes: [
              {
                attributes: [
                  {
                    as: "dialog",
                    attributes: [
                      {
                        attributes: [
                          modalHeaderSchema,
                          roleFormSchema,
                          modalFooterSchema,
                        ],
                        componentName: "Html",
                        props: (options: FunctionArgumentType) => ({
                          formDataId: options.data?.id,
                        }),
                      },
                    ],
                    css: SETTINGS_CONSTANTS.MODAL.CONTAINER_CSS,
                    componentName: "Html",
                    open: true,
                    props: (options: FunctionArgumentType) => ({
                      style: {
                        "z-index": options.zIndex + 1,
                      },
                    }),
                  },
                ],
                componentName: "Html", as: "portal",
                props: (options: FunctionArgumentType) => ({
                  hide: !options.contextData.modalState[0]?.showModal,
                }),
              },
            ],
            componentName: "ZIndex",
          },
        ],
        componentName: "Html",
      },
    ],
    componentName: "Data",
    name: "modalState",

    props: () => ({
      data: createStore({
        isLoading: false,
        showModal: false,
      }),
    }),
  };

  return { attributes: [schema], key: "Role" } as IFormMetaData;
};
