import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";
import type { Vertex } from "~/lib/graph/graph";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";
import { onMutatDataGet } from "~/lib/graph/mutate/onMutatDataGet";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";
import { PROPERTIES, SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { addEditButtonSchema } from "~/pages/subdomain/functions/addEditButtonSchema";

import { loadingIconSchema } from "../../role/functions/loadingIconSchema";

export const supportTicketFormSchema = {
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
              componentName: "Text",
              text: "Status",
            },
            {
              class: PROPERTIES.Css.TextField,
              collection: "g:'SupportStatus'",
              componentName: "Select",
              key: "SupportStatus",
              labelKey: "::'P.name'",
              title: "Status",
            },
          ],
          class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
          componentName: "Box",
        },
        {
          as: "div",
          attributes: [
            {
              class: SETTINGS_CONSTANTS.LABEL_CLASS,
              componentName: "Text",
              text: "Message",
            },
            {
              class: PROPERTIES.Css.TextField,
              componentName: "TextArea",
              key: "message",
              props: (options: FunctionArgumentType) => ({
                readonly: true,
                value: options.data.P.message,
              }),
            },
          ],
          class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
          componentName: "Box",
        },
        {
          as: "div",
          attributes: [
            {
              class: SETTINGS_CONSTANTS.LABEL_CLASS,
              componentName: "Text",
              text: "Previous Replies",
            },
            {
              class: PROPERTIES.Css.TextField,
              componentName: "TextArea",
              key: "replies",
              props: (options: FunctionArgumentType) => ({
                readonly: true,
                value: options.data.P.replies
                  ?.map(
                    (reply: Vertex) =>
                      `${new Date(reply.P.createdAt).toLocaleString()} - ${
                        reply.P.message
                      } (by ${reply.P.createdBy})`,
                  )
                  .join("\n"),
              }),
            },
          ],
          class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
          componentName: "Box",
        },
        {
          as: "div",
          attributes: [
            {
              class: SETTINGS_CONSTANTS.LABEL_CLASS,
              componentName: "Text",
              text: "Add Reply",
            },
            {
              class: PROPERTIES.Css.TextField,
              componentName: "TextArea",
              key: "newReply",
              placeholder: "Enter your reply",
            },
          ],
          class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
          componentName: "Box",
        },
      ],
      class: SETTINGS_CONSTANTS.FORM_CLASS,
      componentName: "Box",
    },
  ],
  componentName: "Box",
  props: () => {
    return {
      onMount: async (options: FunctionArgumentType) => {
        try {
          options.dataContext.modalState[1]("isLoading", true);
          const response = await postAPI(API.support.getTicketUrl, {
            id: options.data.id,
          });
          if (response.error) {
            throw new Error(response.error);
          }
          options.setGraphData(response.graph, {});
        } catch (error) {
          options.showErrorToast((error as Error).message);
        } finally {
          options.dataContext.modalState[1]("isLoading", false);
        }
      },
    };
  },
};

export const getSupportTicketFormSchema = (onSuccess: () => void) => {
  const { showErrorToast, showSuccessToast } = useToast();

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
        showErrorToast(response.error);
      } else {
        onMutatDataGet(options.graph, options.setGraph, response);
        showSuccessToast("Support ticket updated successfully");
        onSuccess();
      }
    } catch (error) {
      showErrorToast((error as Error).message);
    } finally {
      options.dataContext.modalState[1]("isLoading", false);
    }
  };

  const modalHeaderSchema = {
    as: "div",
    attributes: [
      {
        class: SETTINGS_CONSTANTS.MODAL.HEADER.TEXT_CLASS,
        componentName: "Text",
        text: "Edit Support Ticket",
      },
    ],
    class: SETTINGS_CONSTANTS.MODAL.HEADER.CLASS,
    componentName: "Box",
  };

  const modalFooterSchema = {
    as: "div",
    attributes: [
      {
        class: SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CLASS,
        componentName: "Button",
        props: (options: FunctionArgumentType) => ({
          disabled: options.dataContext.modalState[0]?.isLoading,
          onClick: handleSave,
          text: options.dataContext.modalState[0]?.isLoading
            ? "Saving..."
            : "Save",
        }),
      },
      {
        class: SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CLASS,
        componentName: "Button",
        props: (options: FunctionArgumentType) => ({
          onClick: () => {
            options.dataContext.modalState[1]("showModal", false);
          },
          text: "Cancel",
        }),
      },
    ],
    class: SETTINGS_CONSTANTS.MODAL.FOOTER.CLASS,
    componentName: "Box",
  };

  const schema = {
    attributes: [
      {
        as: "div",
        attributes: [
          addEditButtonSchema("SupportTicket"),
          {
            as: "div",
            attributes: [],
            class: SETTINGS_CONSTANTS.MODAL.OVERLAY_CLASS,
            componentName: "Box",
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
                      modalFooterSchema,
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
        componentName: "Box",
      },
    ],
    componentName: "Data",
    name: "modalState",
    noRepeat: true,
    props: () => ({
      data: createStore({
        isLoading: false,
        showModal: false,
      }),
    }),
  };

  return { attributes: [schema], key: "SupportTicket" } as IFormMetaData;
};
