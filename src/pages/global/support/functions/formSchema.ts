import animateScrollTo from "animated-scroll-to";
import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { MutationResult } from "~/cypher/types/MutationArgs";
import type { Vertex } from "~/lib/graph/graph";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { evalExpression } from "~/lib/expression_eval";
import { isAdminRole } from "~/lib/graph/get/sync/auth/isAdminRole";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import { onMutatDataGet } from "~/lib/graph/mutate/data/onMutatDataGet";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { PROPERTIES, SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { addEditButtonSchema } from "~/pages/subdomain/functions/addEditButtonSchema";

import { loadingIconSchema } from "../../../../lib/schema/loadingIconSchema";
import { css } from "~/lib/styles";

export const getSupportTicketFormSchema = (onSuccess: () => void) => {
  const actionButtonsSchema = {
    as: "div",
    attributes: [
      {
        as: "button",
        css: SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CSS,
        componentName: "Html",
        props: (options: FunctionArgumentType) => ({
          disabled: options.dataContext.modalState[0]?.isLoading,
          onClick: () => handleSave(options),
          text: options.dataContext.modalState[0]?.isLoading
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
            options.dataContext.modalState[1]("showModal", false);
            options.revertTransactionUpToIndex(options.txnId, -1);
          },
          text: "Cancel",
        }),
        type: "button",
      },
    ],
    css: SETTINGS_CONSTANTS.MODAL.FOOTER.CSS.replace("top", "bottom"),
    componentName: "Html",
    props: (options: FunctionArgumentType) => ({
      hide: !isAdminRole(options.graph),
    }),
  };
  const chatHistorySchema = {
    attributes: [
      {
        collection: "g:'Reply'",
        componentName: "MultiSelect",
        displayName: "Parent Support",
        inward: true,
        key: "ParentSupport",
        props: () => ({
          hide: true,
        }),
        type: "ParentSupport",
      },
      {
        as: "span",
        css: SETTINGS_CONSTANTS.LABEL_CSS,
        componentName: "Html",
        text: "Replies",
      },
      {
        as: "div",
        attributes: [
          {
            as: "div",
            attributes: [
              {
                as: "div",
                attributes: [
                  {
                    as: "div",
                    attributes: [
                      {
                        as: "div",
                        attributes: [
                          {
                            as: "div",
                            attributes: [
                              {
                                as: "div",
                                attributes: [
                                  {
                                    as: "div",
                                    css: css`
  font-weight: bold;
`,
                                    componentName: "Html",
                                    props: (options: FunctionArgumentType) => ({
                                      text:
                                        options.dataContext.history?.P.email ||
                                        "Anonymous",
                                    }),
                                  },
                                  {
                                    as: "div",
                                    componentName: "Html",
                                    props: (options: FunctionArgumentType) => ({
                                      text: options.dataContext.history?.P
                                        .message,
                                    }),
                                  },
                                  {
                                    as: "div",
                                    css: css`
  font-size: 12px;
  color: \${args.theme.var.color.base};
`,
                                    componentName: "Html",
                                    props: (options: FunctionArgumentType) => ({
                                      text: new Date(
                                        options.dataContext.history?.P
                                          .createdAt,
                                      ).toLocaleString(),
                                    }),
                                  },
                                ],
                                componentName: "Html",
                                props: () => {
                                  // const isUser = options.data?.P.email !== "Support";
                                  // ${isUser ? 'bg:primary-10' : 'bg:base-10'}
                                  return {
                                    css: css`
  display: inline-block;
  padding: 8px;
  border-radius: 6px;
  background-color: \${args.theme.var.color.base_20};
`,
                                  };
                                },
                              },
                            ],
                            componentName: "Html",
                            props: () => {
                              // const isUser = options.data?.P.email !== "Support";
                              // isUser ? 'text-align:right;' : ''}`
                              return {
                                css: css`
  margin-bottom: 12px;
`,
                              };
                            },
                          },
                        ],
                        componentName: "Html",
                      },
                    ],
                    componentName: "Data",
                    loop: true,
                    name: "history",
                    props: (options: FunctionArgumentType) => ({
                      data: () =>
                        evalExpression("<-ParentSupport", {
                          graph: options.graph,
                          setGraph: options.setGraph,
                          vertexes: [options.graph.vertexes[options.data?.id]],
                        }).sort(
                          (a: Vertex, b: Vertex) =>
                            new Date(a.P.createdAt).getTime() -
                            new Date(b.P.createdAt).getTime(),
                        ),
                    }),
                    // emptyState: {
                    //   as: "div",
                    //   css: css`
                    //   padding: 8px;
                    //   text-align: center;
                    //   color: #1e293b;
                    // `,
                    //   componentName: "Html",
                    //   text: "No messages yet",
                    // },
                  },
                ],
                css: css`
  max-height: 300px;
  min-height: 100px;
  overflow-y: auto;
  border: 1px solid \${args.theme.var.color.base_40};
  border-radius: 6px;
  padding: 12px;
  background-color: \${args.theme.var.color.base_20};
  /* chat-history-container */
`,
                componentName: "Html",
              },
              {
                as: "div",
                attributes: [
                  {
                    as: "div",
                    attributes: [
                      {
                        css: PROPERTIES.Css.TextFieldCss + " flex-grow:1 mr:8",
                        componentName: "TextArea",
                        key: "newReply",
                        placeholder: "Type your reply here...",
                        props: (options: FunctionArgumentType) => ({
                          onInput: (e: { target: HTMLTextAreaElement }) => {
                            options.dataContext.replyState[1](
                              "replyText",
                              e.target.value,
                            );
                          },
                          value:
                            options.dataContext.replyState[0]?.replyText || "",
                        }),
                      },
                      {
                        as: "button",
                        css: css`
  background-color: \${args.theme.var.color.primary};
  color: \${args.theme.var.color.base};
  padding: 8px 16px;  
  border-radius: 6px;
`,
                        componentName: "Html",
                        props: (options: FunctionArgumentType) => ({
                          disabled:
                            !options.dataContext.replyState[0]?.replyText?.trim(),
                          onClick: async () => {
                            const replyText =
                              options.dataContext.replyState[0]?.replyText;
                            if (!replyText?.trim()) {
                              return;
                            }

                            try {
                              options.dataContext.modalState[1](
                                "isLoading",
                                true,
                              );

                              // Add reply to the ticket
                              const response = await postAPI(
                                API.support.replyUrl,
                                {
                                  message: replyText,
                                  ticketId: options.data?.id,
                                },
                              );

                              if (response.error) {
                                throw new Error(response.error);
                              }

                              // Update the graph with the new data
                              setGraphData(
                                options.graph,
                                options.setGraph,
                                response.graph,
                                { skipExisting: true },
                              );

                              // Clear the input field
                              options.dataContext.replyState[1](
                                "replyText",
                                "",
                              );

                              // Show success message
                              options.showSuccessToast(
                                "Reply sent successfully",
                              );

                              // Scroll chat history to the bottom
                              setTimeout(() => {
                                const chatHistory = document.querySelector(
                                  ".chat-history-container",
                                );
                                if (chatHistory) {
                                  animateScrollTo(chatHistory.scrollHeight, {
                                    elementToScroll: chatHistory,
                                  });
                                }
                              }, 100);
                            } catch (error) {
                              options.showErrorToast((error as Error).message);
                            } finally {
                              options.dataContext.modalState[1](
                                "isLoading",
                                false,
                              );
                            }
                          },
                        }),
                        text: "Send",
                        type: "button",
                      },
                    ],
                    css: css`
  display: flex;
  margin-top: 8px;
`,
                    componentName: "Html",
                  },
                ],
                componentName: "Html",
              },
            ],
            componentName: "Html",
          },
        ],
        componentName: "Html",
      },
    ],
    componentName: "Data",
    name: "replyState",

    props: () => ({
      data: createStore({
        replyText: "",
      }),
    }),
  } as IFormMetaData;
  const supportTicketFormSchema = {
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
                text: "Status",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                collection: "g:'SupportStatus'",
                componentName: "Select",
                key: "SupportStatus",
                labelKey: "::'P.name'",
                props: (options: FunctionArgumentType) => ({
                  disabled: !isAdminRole(options.graph),
                }),
                title: "Status",
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
                text: "Message",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "TextArea",
                key: "message",
                props: (options: FunctionArgumentType) => ({
                  disabled: true,
                  value: options.data?.P.message,
                }),
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
          },
          actionButtonsSchema,
        ],
        css: SETTINGS_CONSTANTS.FORM_CSS,
        componentName: "Html",
      },
    ],
    componentName: "Html",
    props: (options: FunctionArgumentType) => {
      return {
        onMount: async () => {
          try {
            options.dataContext.modalState[1]("isLoading", true);
            const response = await postAPI(API.support.getTicketUrl, {
              id: options.data?.id,
            });
            if (response.error) {
              throw new Error(response.error);
            }
            options.setGraphData(0, response.graph, {});
          } catch (error) {
            options.showErrorToast((error as Error).message);
          } finally {
            options.dataContext.modalState[1]("isLoading", false);
            // Scroll chat history to the bottom on mount
            setTimeout(() => {
              const chatHistory = document.querySelector(
                ".chat-history-container",
              );
              if (chatHistory) {
                animateScrollTo(chatHistory.scrollHeight, {
                  elementToScroll: chatHistory,
                });
              }
            }, 100);
          }
        },
        onUnmount: () => {
          options.revertTransactionUpToIndex(options.txnId, -1);
        },
      };
    },
  };

  const handleSave = async (options: FunctionArgumentType) => {
    try {
      options.dataContext.modalState[1]("isLoading", true);
      const data = commitTxn(options.txnId, options.graph);
      if (!data) {
        return;
      }
      const response = await postAPI(API.support.upsertTicketUrl, {
        data,
        ticket: options.data,
      });

      if (response.error) {
        options.showErrorToast(response.error as string);
      } else {
        options.removeTxnIdAndCreateNew(options.txnId);
        options.ensureData();
        onMutatDataGet(
          options.graph,
          options.setGraph,
          response as MutationResult,
        );
        options.showSuccessToast("Support ticket updated successfully");
        options.dataContext.modalState[1]("showModal", false);
        onSuccess();
      }
    } catch (error) {
      options.showErrorToast((error as Error).message);
    } finally {
      options.dataContext.modalState[1]("isLoading", false);
    }
  };

  const modalHeaderSchema = {
    as: "div",
    attributes: [
      {
        as: "span",
        css: SETTINGS_CONSTANTS.MODAL.HEADER.TEXT_CSS,
        componentName: "Html",
        text: "Edit Support Ticket",
      },
      {
        as: "button",
        attributes: [
          {
            componentName: "Icon",
            icon: "ph:x",
          },
        ],
        css: css`
  border: none;
  background-color: transparent;
  cursor: pointer;
  color: \${args.theme.var.color.base};
  font-size: 20px;
  &:hover {
    color: \${args.theme.var.color.primary};
  }
`,
        componentName: "Html",
        props: (options: FunctionArgumentType) => ({
          onClick: () => {
            options.dataContext.modalState[1]("showModal", false);
            options.revertTransactionUpToIndex(options.txnId, -1);
          },
        }),
      },
    ],
    css: [
      SETTINGS_CONSTANTS.MODAL.HEADER.CSS,
      css`
        display: flex;
        align-items: center;
        justify-content: space-between;
      `,
    ],
    componentName: "Html",
  };

  const schema = {
    attributes: [
      {
        as: "div",
        attributes: [
          addEditButtonSchema("Support"),
          {
            as: "div",
            attributes: [],
            css: SETTINGS_CONSTANTS.MODAL.OVERLAY_CSS,
            componentName: "Html",
            props: (options: FunctionArgumentType) => ({
              hide: !options.dataContext.modalState[0]?.showModal,
            }),
          },
          {
            attributes: [
              {
                attributes: [
                  {
                    as: "dialog",
                    attributes: [
                      modalHeaderSchema,
                      supportTicketFormSchema,
                      {
                        as: "div",
                        attributes: [chatHistorySchema],
                        css: css`
  padding: 4px;
`,
                        componentName: "Html",
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
                componentName: "Portal",
                props: (options: FunctionArgumentType) => ({
                  hide: !options.dataContext.modalState[0]?.showModal,
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

  return { attributes: [schema], key: "Support" } as IFormMetaData;
};
