import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

import { useToast } from "~/components/styled/modal/Toast";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/general/getApi";
import { getErrorSchema } from "~/lib/schema/getErrorSchema";
import { validateEmail } from "~/lib/validation/validateEmail";

import { handleApiRequest } from "../../../lib/api/general/handleApiRequest";
import { SchemaRenderer } from "../../SchemaRenderer";
import { PROPERTIES, SETTINGS_CONSTANTS } from "../../settings/constants";
import { css } from "~/lib/styles";

// Validation functions
const validateRequired = (value: string) => {
  if (!value || value.trim() === "") {
    return "This field is required";
  }
  return undefined;
};

const validatePort = (value: string) => {
  if (!value) {
    return "Port is required";
  }
  const port = Number.parseInt(value, 10);
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    return "Port must be a number between 1 and 65535";
  }
  return undefined;
};

// Validation function based on provider
const validateFormData = (data: any) => {
  const errors: Record<string, string> = {};
  const provider = data.active;

  if (provider === "smtp") {
    // SMTP validation
    const smtpHostError = validateRequired(data.smtpHost);
    if (smtpHostError) {
      errors.smtpHost = smtpHostError;
    }

    const smtpPortError = validatePort(data.smtpPort);
    if (smtpPortError) {
      errors.smtpPort = smtpPortError;
    }

    const smtpUsernameError = validateRequired(data.smtpUsername);
    if (smtpUsernameError) {
      errors.smtpUsername = smtpUsernameError;
    }

    const smtpPasswordError = validateRequired(data.smtpPassword);
    if (smtpPasswordError) {
      errors.smtpPassword = smtpPasswordError;
    }
  } else if (provider === "sendgrid") {
    // SendGrid validation
    const sendGridApiKeyError = validateRequired(data.sendGridApiKey);
    if (sendGridApiKeyError) {
      errors.sendGridApiKey = sendGridApiKeyError;
    }
  }

  // From email is required for all providers if a provider is selected
  if (provider) {
    const fromEmailError = data.fromEmail
      ? validateEmail(data.fromEmail)
      : "From email is required";
    if (fromEmailError) {
      errors.fromEmail = fromEmailError;
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

export function EmailSettings() {
  const { showErrorToast, showSuccessToast } = useToast();
  const loadSettingsData = async () => {
    return await getAPI(API.settings.email.getUrl);
  };

  const form = {
    as: "",
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
                text: "Email Provider",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "Select",
                defaultValue: "",
                key: "active",
                options: [
                  { id: "", label: "Not Configured" },
                  { id: "smtp", label: "SMTP" },
                  { id: "sendgrid", label: "SendGrid" },
                  // Add other providers as needed
                ],
                placeholder: "Select Email Provider",
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
          },
          getErrorSchema("active", css`color:red; margin-top: -20px;`),
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "SMTP Host",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "TextInput",
                key: "smtpHost",
                placeholder: "Enter SMTP host",
                validate: (value: string, data: any) =>
                  data.P.active === "smtp"
                    ? validateRequired(value)
                    : undefined,
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
            props: (options: FunctionArgumentType) => ({
              hide: () => options.data?.P.active !== "smtp",
            }),
          },
          getErrorSchema("smtpHost", css`color:red; margin-top: -20px;`),
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "SMTP Port",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "TextInput",
                key: "smtpPort",
                placeholder: "Enter SMTP port",
                type: "number",
                validate: (value: string, data: any) =>
                  data.P.active === "smtp" ? validatePort(value) : undefined,
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
            props: (options: FunctionArgumentType) => ({
              hide: () => options.data?.P.active !== "smtp",
            }),
          },
          getErrorSchema("smtpPort", css`color:red; margin-top: -20px;`),
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "SMTP Username",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "TextInput",
                key: "smtpUsername",
                placeholder: "Enter SMTP username",
                validate: (value: string, data: any) =>
                  data.P.active === "smtp"
                    ? validateRequired(value)
                    : undefined,
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
            props: (options: FunctionArgumentType) => ({
              hide: () => options.data?.P.active !== "smtp",
            }),
          },
          getErrorSchema("smtpUsername", css`color:red; margin-top: -20px;`),
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "SMTP Password",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "TextInput",
                key: "smtpPassword",
                placeholder: "Enter SMTP password",
                type: "password",
                validate: (value: string, data: any) =>
                  data.P.active === "smtp"
                    ? validateRequired(value)
                    : undefined,
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
            props: (options: FunctionArgumentType) => ({
              hide: () => options.data?.P.active !== "smtp",
            }),
          },
          getErrorSchema("smtpPassword", css`color:red; margin-top: -20px;`),
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "SendGrid API Key",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "TextInput",
                key: "sendGridApiKey",
                placeholder: "Enter SendGrid API key",
                type: "password",
                validate: (value: string, data: any) =>
                  data.P.active === "sendgrid"
                    ? validateRequired(value)
                    : undefined,
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
            props: (options: FunctionArgumentType) => ({
              hide: () => options.data?.P.active !== "sendgrid",
            }),
          },
          getErrorSchema("sendGridApiKey", css`color:red; margin-top: -20px;`),
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "From Email",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "TextInput",
                key: "fromEmail",
                placeholder: "Enter from email address",
                type: "email",
                validate: (value: string, data: any) => {
                  if (!data.P.active) {
                    return undefined;
                  }
                  if (!value) {
                    return "From email is required";
                  }
                  return validateEmail(value);
                },
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
            props: (options: FunctionArgumentType) => ({
              hide: () => !options.data?.P.active,
            }),
          },
          getErrorSchema("fromEmail", css`color:red; margin-top: -20px;`),
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "Use Secure Connection",
              },
              {
                componentName: "CheckBox",
                key: "secure",
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
            props: (options: FunctionArgumentType) => ({
              hide: () => options.data?.P.active !== "smtp",
            }),
          },
          getErrorSchema("secure", css`color:red; margin-top: -20px;`),
          {
            as: "div",
            attributes: [
              {
                attributes: [
                  {
                    as: "button",
                    css: SETTINGS_CONSTANTS.SAVE_BUTTON_CSS,
                    componentName: "Html",
                    props: (options: FunctionArgumentType) => ({
                      disabled: options.dataContext.saveState[0]?.isLoading,
                      onClick: async () => {
                        // Validate form data
                        const settings = options.data;
                        const errors = validateFormData(settings.P);

                        if (errors) {
                          // Show validation errors
                          for (const fieldKey in errors) {
                            options.setError(errors[fieldKey], fieldKey);
                          }
                          showErrorToast("Please fix the validation errors");
                          return;
                        }

                        options.clearAllErrors();

                        // Use the common handleApiRequest function
                        await handleApiRequest(
                          API.settings.email.updateUrl,
                          settings.P,
                          "Email settings updated successfully",
                          (isLoading) =>
                            options.dataContext.saveState[1](
                              "isLoading",
                              isLoading,
                            ),
                          showSuccessToast,
                          showErrorToast,
                        );
                      },
                      text: options.dataContext.saveState[0]?.isLoading
                        ? "Saving..."
                        : "Save Changes",
                    }),
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
              {
                attributes: [
                  {
                    as: "button",
                    css: SETTINGS_CONSTANTS.SECONDARY_BUTTON_CSS,
                    componentName: "Html",
                    props: (options: FunctionArgumentType) => ({
                      disabled: options.dataContext.testState[0]?.isLoading,
                      onClick: async () => {
                        // Validate form data first
                        const settings = options.data;
                        const errors = validateFormData(settings.P);

                        if (errors) {
                          // Show validation errors
                          for (const fieldKey in errors) {
                            options.setError(errors[fieldKey], fieldKey);
                          }
                          showErrorToast(
                            "Please fix the validation errors before testing",
                          );
                          return;
                        }

                        options.clearAllErrors();

                        // Set loading state
                        options.dataContext.testState[1]("isLoading", true);

                        try {
                          // First save the settings using handleApiRequest
                          const saveResult = await handleApiRequest(
                            API.settings.email.updateUrl,
                            settings.P,
                            "Settings saved before testing",
                            () => {}, // We're managing loading state manually here
                            () => {}, // Don't show success toast for save before test
                            showErrorToast,
                          );

                          if (!saveResult.success) {
                            options.dataContext.testState[1](
                              "isLoading",
                              false,
                            );
                            return;
                          }

                          // Then test the connection using handleApiRequest
                          await handleApiRequest(
                            API.settings.email.testUrl,
                            settings.P,
                            "Test email sent successfully",
                            () => {}, // We're managing loading state manually here
                            showSuccessToast,
                            showErrorToast,
                          );
                        } catch (error) {
                          showErrorToast((error as Error).message);
                        } finally {
                          options.dataContext.testState[1]("isLoading", false);
                        }
                      },
                      text: options.dataContext.testState[0]?.isLoading
                        ? "Testing..."
                        : "Test Connection",
                      title:
                        "Please save changes and click Test Connection to send test email to current logged in user",
                    }),
                  },
                ],
                componentName: "Data",
                name: "testState",

                props: () => ({
                  data: createStore({
                    isLoading: false,
                  }),
                }),
              },
            ],
            css: css`
  margin-top: 24px;
`,
            componentName: "Html",
          },
        ],
        css: SETTINGS_CONSTANTS.FORM_CSS,
        componentName: "Html",
      },
    ],
    componentName: "Html",
    props: (options: FunctionArgumentType) => ({
      onUnmount: () => {
        options.revertTransactionUpToIndex(options.txnId, -1);
      },
    }),
  };

  return (
    <SchemaRenderer
      form={{ attributes: [form], key: "EmailSettings" }}
      getFormData={loadSettingsData}
    />
  );
}
