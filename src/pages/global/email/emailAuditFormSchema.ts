import { createStore } from "solid-js/store";
import xss, { type IFilterXSSOptions } from "xss";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { Vertex } from "~/lib/graph/graph";
import type {
  FieldAttribute,
  IFormMetaData,
} from "~/lib/meta/FormMetadataType";

import { useToast } from "~/components/styled/modal/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { PROPERTIES, SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { addEditButtonSchema } from "~/pages/subdomain/functions/addEditButtonSchema";

const whiteList = xss.whiteList;
whiteList.html = [];
whiteList.head = [];
whiteList.body = [];
whiteList.style = [];
const _xssOptions: IFilterXSSOptions = {
  onTagAttr: (_tag, name, value, _isWhiteAttr) => {
    if (name === "style") {
      // Allow the style attribute
      return `${name}="${xss.escapeAttrValue(value)}"`;
    }
  },
  stripIgnoreTag: true, // Filter out tags not in the whitelist. Ignore tags like "BASE", "meta" etc. stripIgnoreTagBody: ["script"],
  stripIgnoreTagBody: ["script"],
  whiteList,
};

export const emailAuditFormSchema = {
  as: "div",
  attributes: [
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
              text: "Subject",
              validation: { required: true },
            },
            {
              css: PROPERTIES.Css.TextFieldCss,
              componentName: "TextInput",
              key: "subject",
              placeholder: "Enter email subject",
              validation: {
                regex: {
                  enabled: true,
                  message: "Subject must be between 1 and 200 characters",
                  value: "^.{1,200}$",
                },
                required: true,
              },
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
              text: "Recipients",
              validation: { required: true },
            },
            {
              css: PROPERTIES.Css.TextFieldCss,
              componentName: "TextInput",
              key: "recipients",
              placeholder: "Enter recipients",
              validation: {
                regex: {
                  enabled: true,
                  message: "Please enter valid email addresses",
                  value: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
                },
                required: true,
              },
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
              text: "Content",
              validation: { required: true },
            },
            // {
            //   css: PROPERTIES.Css.TextFieldCss,
            //   componentName: "TextArea",
            //   key: "content",
            //   placeholder: "Enter email content",
            //   validation: { required: true },
            // },
            {
              as: "iframe",
              css: PROPERTIES.Css.TextFieldCss,
              componentName: "Html",
              key: "content",
              props: (options: FunctionArgumentType) => ({
                // srcdoc: xss(options.data?.P.content, xssOptions),
                srcdoc: options.data?.P.content,
              }),
              validation: {
                regex: {
                  enabled: true,
                  message: "Content cannot be empty",
                  value: "^.{1,}$",
                },
                required: true,
              },
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
              text: "Status",
            },
            {
              componentName: "Select",
              key: "status",
              options: [
                { id: "sent", label: "Sent" },
                { id: "failed", label: "Failed" },
                { id: "pending", label: "Pending" },
              ],
              placeholder: "Select status",
            },
          ],
          css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
          componentName: "Html",
        },
      ],
      css: SETTINGS_CONSTANTS.FORM_CSS,
      componentName: "Html",
    },
  ],
  componentName: "Html",
} as FieldAttribute;

export const getEmailAuditFormSchema = (onSuccess: () => void) => {
  const { showErrorToast, showSuccessToast } = useToast();

  const validateForm = (formData: Vertex) => {
    if (!formData.P.subject?.trim()) {
      showErrorToast("Please enter subject");
      return false;
    }
    if (!formData.P.recipients?.trim()) {
      showErrorToast("Please enter recipients");
      return false;
    }
    if (!formData.P.content?.trim()) {
      showErrorToast("Please enter content");
      return false;
    }
    return true;
  };

  const _handleSave = async (options: FunctionArgumentType) => {
    const formData = options.data;
    if (!validateForm(formData)) {
      return;
    }

    try {
      options.dataContext.modalState[1]("isLoading", true);

      const response = await postAPI(API.email.auditUrl, {
        content: formData.P.content,
        recipients: formData.P.recipients,
        status: formData.P.status,
        subject: formData.P.subject,
      });

      if (response.error) {
        showErrorToast(response.error);
      } else {
        // options.removeTxnIdAndCreateNew(options.txnId);
        // as we are creating new transaction, we need to revert to previous state
        options.revertTransactionUpToIndex(options.txnId, -1);
        options.ensureData();
        showSuccessToast("Email audit record saved successfully");
        options.dataContext.modalState[1]("showModal", false);
        onSuccess();
      }
    } catch (error) {
      showErrorToast((error as Error).message);
    } finally {
      options.dataContext.modalState[1]("isLoading", false);
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
        text: "Add New Email Audit",
      },
    ],
    css: SETTINGS_CONSTANTS.MODAL.HEADER.CSS,
    componentName: "Html",
  };

  const modalFooterSchema = {
    as: "div",
    attributes: [
      // {
      //   as: "button",
      //   css: SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CSS,
      //   componentName: "Html",
      //   props: (options: FunctionArgumentType) => ({
      //     disabled: options.dataContext.modalState[0]?.isLoading,
      //     onClick: () => handleSave(options),
      //     text: options.dataContext.modalState[0]?.isLoading
      //       ? "Saving..."
      //       : "Save",
      //   }),
      //   type: "button",
      // },
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
    css: SETTINGS_CONSTANTS.MODAL.FOOTER.CSS,
    componentName: "Html",
  };

  const schema = {
    attributes: [
      {
        as: "div",
        attributes: [
          addEditButtonSchema("Email Audit"),
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
                      emailAuditFormSchema,
                      modalFooterSchema,
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

  return { attributes: [schema], key: "EmailAudit" } as IFormMetaData;
};
