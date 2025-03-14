import { useNavigate } from "@solidjs/router";
import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";
import type { Vertex } from "~/lib/graph/graph";

import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";
import { getErrorSchema } from "~/lib/schema/getErrorSchema";
import { wrapFormInCard } from "~/lib/schema/wrapFormInCard";
import { validateEmail } from "~/lib/validation/validateEmail";
import { SchemaRenderer } from "~/pages/SchemaRenderer";
import { PROPERTIES, SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { getLogoSchema } from "~/routes/internal/page/(email)/BaseEmailTemplate";

export function ContactForm() {
  const navigate = useNavigate();
  const { showErrorToast, showSuccessToast } = useToast();

  const validateFormData = (formData: Vertex) => {
    const { email, message, name, subject } = formData.P;

    if (!name?.trim()) {
      showErrorToast("Please enter your name");
      return false;
    }
    if (name.trim().length < 2) {
      showErrorToast("Name must be at least 2 characters long");
      return false;
    }
    if (!/^[a-zA-Z\s-]{2,100}$/.test(name.trim())) {
      showErrorToast("Name can only contain letters, spaces, and hyphens");
      return false;
    }

    if (!email?.trim()) {
      showErrorToast("Please enter your email address");
      return false;
    }
    const emailError = validateEmail(email);
    if (emailError) {
      showErrorToast(emailError);
      return false;
    }

    if (!subject?.trim()) {
      showErrorToast("Please enter a subject");
      return false;
    }
    if (subject.trim().length < 3) {
      showErrorToast("Subject must be at least 3 characters long");
      return false;
    }
    if (subject.trim().length > 200) {
      showErrorToast("Subject must be less than 200 characters");
      return false;
    }

    if (!message?.trim()) {
      showErrorToast("Please enter your message");
      return false;
    }
    if (message.trim().length < 10) {
      showErrorToast("Message must be at least 10 characters long");
      return false;
    }
    if (message.trim().length > 5000) {
      showErrorToast("Message must be less than 5000 characters");
      return false;
    }

    return true;
  };

  const form = {
    as: "div",
    attributes: [
      {
        as: "h1",
        class: SETTINGS_CONSTANTS.TITLE_CLASS, componentName: "Html",
        text: "Contact Us",
      },
      getLogoSchema("grid place-items:center", "h:80px", "fg:base-20"),
      {
        as: "div",
        attributes: [
          {
            as: "span",
            class: SETTINGS_CONSTANTS.LABEL_CLASS, componentName: "Html",
            text: "Full Name",
            validation: { required: true },
          },
          {
            as: "div",
            attributes: [
              {
                class: PROPERTIES.Css.TextField,
                componentName: "TextInput",
                key: "name",
                placeholder: "Your name",
                props: (options: FunctionArgumentType) => ({
                  onMount: () => {
                    if (options.ref && options.ref() instanceof HTMLInputElement) {
                      options.ref()?.focus();
                    }
                  },
                }),
                validation: {
                  maxLength: 100,
                  minLength: 2,
                  regex: {
                    enabled: true,
                    message: "Name can only contain letters, spaces, and hyphens",
                    value: "^[a-zA-Z\\s-]{2,100}$"
                  },
                  required: true
                },
              }
            ],
            componentName: "Html",
          },
          getErrorSchema("name", "fg:red grid-column:span|2"),
        ],
        class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
        componentName: "Html",
      },
      {
        as: "div",
        attributes: [
          {
            as: "span",
            class: SETTINGS_CONSTANTS.LABEL_CLASS, componentName: "Html",
            text: "Email Address",
            validation: { required: true },
          },
          {
            as: "div",
            attributes: [
              {
                class: PROPERTIES.Css.TextField,
                componentName: "TextInput",
                key: "email",
                placeholder: "Your email",
                type: "email",
                validation: {
                  email: true,
                  required: true,
                  validate: validateEmail
                },
              }
            ],
            componentName: "Html",
          },
          getErrorSchema("email", "fg:red grid-column:span|2"),
        ],
        class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
        componentName: "Html",
      },
      {
        as: "div",
        attributes: [
          {
            as: "span",
            class: SETTINGS_CONSTANTS.LABEL_CLASS, componentName: "Html",
            text: "Subject",
            validation: { required: true },
          },
          {
            as: "div",
            attributes: [
              {
                class: PROPERTIES.Css.TextField,
                componentName: "TextInput",
                key: "subject",
                placeholder: "What's the subject?",
                validation: {
                  maxLength: 200,
                  minLength: 3,
                  required: true
                },
              }
            ],
            componentName: "Html",
          },
          getErrorSchema("subject", "fg:red grid-column:span|2"),
        ],
        class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
        componentName: "Html",
      },
      {
        as: "div",
        attributes: [
          {
            as: "span",
            class: SETTINGS_CONSTANTS.LABEL_CLASS, componentName: "Html",
            text: "Message",
            validation: { required: true },
          },
          {
            as: "div",
            attributes: [
              {
                class: PROPERTIES.Css.TextField,
                componentName: "TextArea",
                key: "message",
                placeholder: "Write your message...",
                validation: {
                  maxLength: 5000,
                  minLength: 10,
                  required: true
                },
              }
            ],
            componentName: "Html",
          },
          getErrorSchema("message", "fg:red grid-column:span|2"),
        ],
        class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
        componentName: "Html",
      },
      {
        as: "div",
        attributes: [
          {
            attributes: [
              {
                as: "button",
                class: SETTINGS_CONSTANTS.SAVE_BUTTON_CLASS,
                componentName: "Html",
                props: (options: FunctionArgumentType) => ({
                  disabled: options.dataContext.saveState[0]?.isLoading,
                  onClick: async () => {
                    try {
                      if (!validateFormData(options.data)) {
                        return;
                      }
                      options.dataContext.saveState[1]("isLoading", true);
                      const formData = options.data.P;
                      const response = await postAPI(
                        API.support.createTicketUrl,
                        {
                          email: formData.email.toLowerCase(),
                          message: formData.message.trim(),
                          name: formData.name.trim(),
                          subject: formData.subject.trim(),
                        },
                      );

                      if (response.error) {
                        showErrorToast(response.error as string);
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
                type: "button",
              },
            ],
            componentName: "Data",
            name: "saveState",
            
            props: () => ({
              data: createStore({
                isLoading: false,
              }),
            }),
          },
        ],
        class: "mt:24",
        componentName: "Html",
      },
    ],
    class: SETTINGS_CONSTANTS.FORM_CLASS,
    componentName: "Html",
    props: (options: FunctionArgumentType) => ({
      onUnmount: () => {
        options.revertTransactionUpToIndex(options.txnId, -1);
      },
    }),
  };

  return (
    <SchemaRenderer
      form={{ attributes: [wrapFormInCard(form)], key: "ContactForm" }}
    />
  );
}
