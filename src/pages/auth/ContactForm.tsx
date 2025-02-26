import { useNavigate } from "@solidjs/router";
import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";

import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";
import { wrapFormInCard } from "~/lib/utils/formWrapper";
import { SchemaRenderer } from "~/pages/SchemaRenderer";
import { PROPERTIES, SETTINGS_CONSTANTS } from "~/pages/settings/constants";

export function ContactForm() {
  const navigate = useNavigate();
  const { showErrorToast, showSuccessToast } = useToast();

  const form = {
    as: "div",
    attributes: [
      {
        as: "div",
        attributes: [
          {
            class: SETTINGS_CONSTANTS.LABEL_CLASS,
            componentName: "Text",
            text: "Full Name",
            validation: { required: true },
          },
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextInput",
            key: "name",
            placeholder: "Your name",
            validation: { required: true },
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
            text: "Email Address",
            validation: { required: true },
          },
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextInput",
            key: "email",
            placeholder: "Your email",
            type: "email",
            validation: { required: true },
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
            text: "Subject",
            validation: { required: true },
          },
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextInput",
            key: "subject",
            placeholder: "What's the subject?",
            validation: { required: true },
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
            validation: { required: true },
          },
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextArea",
            key: "message",
            placeholder: "Write your message...",
            validation: { required: true },
          },
        ],
        class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
        componentName: "Box",
      },
      {
        as: "div",
        attributes: [
          {
            attributes: [
              {
                as: "button",
                class: SETTINGS_CONSTANTS.SAVE_BUTTON_CLASS,
                componentName: "Box",
                props: (options: FunctionArgumentType) => ({
                  disabled: options.dataContext.saveState[0]?.isLoading,
                  onClick: async () => {
                    try {
                      options.dataContext.saveState[1]("isLoading", true);
                      const formData = options.data.P;
                      const response = await postAPI(API.support.createTicketUrl, {
                        email: formData.email.toLowerCase(),
                        message: formData.message,
                        name: formData.name,
                        subject: formData.subject,
                      });
                      
                      if (response.error) {
                        showErrorToast(response.error);
                      } else {
                        showSuccessToast("Support ticket created successfully");
                        navigate("/");
                      }
                    } catch (error) {
                      showErrorToast((error as Error).message);
                    } finally {
                      options.dataContext.saveState[1]("isLoading", false);
                    }
                  },
                  text: options.dataContext.saveState[0]?.isLoading
                    ? "Sending..."
                    : "Send Message",
                }),
              },
            ],
            componentName: "Data",
            name: "saveState",
            noRepeat: true,
            props: () => ({
              data: createStore({
                isLoading: false,
              }),
            }),
          },
        ],
        class: "mt:24",
        componentName: "Box",
      },
    ],
    class: SETTINGS_CONSTANTS.FORM_CLASS,
    componentName: "Box",
  };

  return (
    <SchemaRenderer
      form={{ attributes: [wrapFormInCard(form)], key: "ContactForm" }}
    />
  );
}
