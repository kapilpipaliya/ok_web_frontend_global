import animateScrollTo from "animated-scroll-to";
import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";
import type { MutationResult } from "~/cypher/types/MutationArgs";
import type { Vertex } from "~/lib/graph/graph";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";
import { evalExpression } from "~/lib/expression_eval";
import { isAdminRole } from "~/lib/graph/get/sync/auth/isAdminRole";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import { onMutatDataGet } from "~/lib/graph/mutate/data/onMutatDataGet";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { PROPERTIES, SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { addEditButtonSchema } from "~/pages/subdomain/functions/addEditButtonSchema";

import { loadingIconSchema } from "../../role/functions/loadingIconSchema";

export const getSupportTicketFormSchema = (onSuccess: () => void) => {
  const actionButtonsSchema = {
    as: "div",
    attributes: [
      {
        as: "button",
        class: SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CLASS,
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
        class: SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CLASS,
        componentName: "Html",
        props: (options: FunctionArgumentType) => ({
          onClick: () => {
            options.dataContext.modalState[1]("showModal", false);
          },
          text: "Cancel",
        }),
        type: "button",
      },
    ],
    class: SETTINGS_CONSTANTS.MODAL.FOOTER.CLASS.replace("top", "bottom"),
    componentName: "Html",
    props: (options: FunctionArgumentType) => ({
      hidden: !isAdminRole(options.graph),
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
          hidden: true,
        }),
        type: "ParentSupport",
      },
      {
        class: SETTINGS_CONSTANTS.LABEL_CLASS,
        as: "span", componentName: "Html",
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
                                    class: "font-weight:bold",
                                    as: "span", componentName: "Html",
                                    props: (options: FunctionArgumentType) => ({
                                      text: options.data.P.email || "Anonymous",
                                    }),
                                  },
                                  {
                                    as: "div",
                                    as: "span", componentName: "Html",
                                    props: (options: FunctionArgumentType) => ({
                                      text: options.data.P.message,
                                    }),
                                  },
                                  {
                                    as: "div",
                                    class: "font-size:12px color:base-50",
                                    as: "span", componentName: "Html",
                                    props: (options: FunctionArgumentType) => ({
                                      text: new Date(
                                        options.data.P.createdAt,
                                      ).toLocaleString(),
                                    }),
                                  },
                                ],
                                componentName: "Html",
                                props: () => {
                                  // const isUser = options.data.P.email !== "Support";
                                  // ${isUser ? 'bg:primary-10' : 'bg:base-10'}
                                  return {
                                    class:
                                      "display:inline-block p:8 r:6 bg:base-10",
                                  };
                                },
                              },
                            ],
                            componentName: "Html",
                            props: () => {
                              // const isUser = options.data.P.email !== "Support";
                              // isUser ? 'text-align:right' : ''}`
                              return {
                                class: "mb:12",
                              };
                            },
                          },
                        ],
                        componentName: "Html",
                      },
                    ],
                    componentName: "Data",
                    props: (options: FunctionArgumentType) => ({
                      data: () =>
                        evalExpression("<-ParentSupport", {
                          graph: options.graph,
                          setGraph: options.setGraph,
                          vertexes: [options.graph.vertexes[options.data.id]],
                        }).sort(
                          (a: Vertex, b: Vertex) =>
                            new Date(a.P.createdAt).getTime() -
                            new Date(b.P.createdAt).getTime(),
                        ),
                    }),
                    // emptyState: {
                    //   as: "div",
                    //   class: "p:8 text-align:center color:base-50",
                    //   as: "span", componentName: "Html",
                    //   text: "No messages yet",
                    // },
                  },
                ],
                class:
                  "max-h:300px min-h:100px overflow-y:auto border:1px|solid|base-20 r:6 p:12 bg:base-5 chat-history-container",
                componentName: "Html",
              },
              {
                as: "div",
                attributes: [
                  {
                    as: "div",
                    attributes: [
                      {
                        class: PROPERTIES.Css.TextField + " flex-grow:1 mr:8",
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
                        class: "bg:primary color:white p:8|16 r:6",
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
                                  ticketId: options.data.id,
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
                    class: "display:flex mt:8",
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
                class: SETTINGS_CONSTANTS.LABEL_CLASS,
                as: "span", componentName: "Html",
                text: "Status",
              },
              {
                class: PROPERTIES.Css.TextField,
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
            class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
            componentName: "Html",
          },
          {
            as: "div",
            attributes: [
              {
                class: SETTINGS_CONSTANTS.LABEL_CLASS,
                as: "span", componentName: "Html",
                text: "Message",
              },
              {
                class: PROPERTIES.Css.TextField,
                componentName: "TextArea",
                key: "message",
                props: (options: FunctionArgumentType) => ({
                  disabled: true,
                  value: options.data.P.message,
                }),
              },
            ],
            class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
            componentName: "Html",
          },
          actionButtonsSchema,
        ],
        class: SETTINGS_CONSTANTS.FORM_CLASS,
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
              id: options.data.id,
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
        onMutatDataGet(
          options.graph,
          options.setGraph,
          response as MutationResult,
        );
        options.showSuccessToast("Support ticket updated successfully");
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
        class: SETTINGS_CONSTANTS.MODAL.HEADER.TEXT_CLASS,
        as: "span", componentName: "Html",
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
        class:
          "border:none bg:transparent cursor:pointer color:base-50 hover:color:primary font-size:20px",
        componentName: "Html",
        props: (options: FunctionArgumentType) => ({
          onClick: () => {
            options.dataContext.modalState[1]("showModal", false);
          },
        }),
      },
    ],
    class:
      SETTINGS_CONSTANTS.MODAL.HEADER.CLASS +
      " flex ai:center justify-content:space-between",
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
            class: SETTINGS_CONSTANTS.MODAL.OVERLAY_CLASS,
            componentName: "Html",
            props: (options: FunctionArgumentType) => ({
              hidden: !options.dataContext.modalState[0]?.showModal,
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
                        class: "p:4",
                        componentName: "Html",
                      },
                    ],
                    class: SETTINGS_CONSTANTS.MODAL.CONTAINER_CLASS,
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
                  hidden: !options.dataContext.modalState[0]?.showModal,
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
