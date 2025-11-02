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

// Define types for state stores
type SaveStateStore = ReturnType<
  typeof createStore<{
    isLoading: boolean;
  }>
>;

type TestStateStore = ReturnType<
  typeof createStore<{
    isLoading: boolean;
  }>
>;

// Define type for email settings data
interface EmailSettingsData {
  active?: string;
  smtpHost?: string;
  smtpPort?: string;
  smtpUsername?: string;
  smtpPassword?: string;
  sendGridApiKey?: string;
  fromEmail?: string;
  secure?: boolean;
  [key: string]: unknown;
}

// Extend FunctionArgumentType to include our contextData
interface EmailSettingsFunctionArgumentType extends FunctionArgumentType {
  contextData: {
    saveState: SaveStateStore;
    testState: TestStateStore;
    [key: string]: unknown;
  };
}

// Validation functions
const validateRequired = (value: string | undefined) => {
  if (!value || value.trim() === "") {
    return "This field is required";
  }
  return undefined;
};

const validatePort = (value: string | undefined) => {
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
const validateFormData = (data: EmailSettingsData) => {
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
          getErrorSchema(
            "active",
            `return \`._id {color: \${args.theme.var.color.error}; margin-top: -20px;}\`;`,
          ),
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
                componentName: "SystemTextInput",
                key: "smtpHost",
                placeholder: "Enter SMTP host",
                validate: (value: string, data: Record<string, unknown>) =>
                  data.P && (data.P as EmailSettingsData).active === "smtp"
                    ? validateRequired(value)
                    : undefined,
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
            props: (options: EmailSettingsFunctionArgumentType) => ({
              hide: () => options.data?.P.active !== "smtp",
            }),
          },
          getErrorSchema(
            "smtpHost",
            `return \`._id {color: \${args.theme.var.color.error}; margin-top: -20px;}\`;`,
          ),
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
                componentName: "SystemTextInput",
                key: "smtpPort",
                placeholder: "Enter SMTP port",
                type: "number",
                validate: (value: string, data: Record<string, unknown>) =>
                  data.P && (data.P as EmailSettingsData).active === "smtp"
                    ? validatePort(value)
                    : undefined,
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
            props: (options: EmailSettingsFunctionArgumentType) => ({
              hide: () => options.data?.P.active !== "smtp",
            }),
          },
          getErrorSchema(
            "smtpPort",
            `return \`._id {color: \${args.theme.var.color.error}; margin-top: -20px;}\`;`,
          ),
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
                componentName: "SystemTextInput",
                key: "smtpUsername",
                placeholder: "Enter SMTP username",
                validate: (value: string, data: Record<string, unknown>) =>
                  data.P && (data.P as EmailSettingsData).active === "smtp"
                    ? validateRequired(value)
                    : undefined,
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
            props: (options: EmailSettingsFunctionArgumentType) => ({
              hide: () => options.data?.P.active !== "smtp",
            }),
          },
          getErrorSchema(
            "smtpUsername",
            `return \`._id {color: \${args.theme.var.color.error}; margin-top: -20px;}\`;`,
          ),
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
                componentName: "SystemTextInput",
                key: "smtpPassword",
                placeholder: "Enter SMTP password",
                type: "password",
                validate: (value: string, data: Record<string, unknown>) =>
                  data.P && (data.P as EmailSettingsData).active === "smtp"
                    ? validateRequired(value)
                    : undefined,
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
            props: (options: EmailSettingsFunctionArgumentType) => ({
              hide: () => options.data?.P.active !== "smtp",
            }),
          },
          getErrorSchema(
            "smtpPassword",
            `return \`._id {color: \${args.theme.var.color.error}; margin-top: -20px;}\`;`,
          ),
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
                componentName: "SystemTextInput",
                key: "sendGridApiKey",
                placeholder: "Enter SendGrid API key",
                type: "password",
                validate: (value: string, data: Record<string, unknown>) =>
                  data.P && (data.P as EmailSettingsData).active === "sendgrid"
                    ? validateRequired(value)
                    : undefined,
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
            props: (options: EmailSettingsFunctionArgumentType) => ({
              hide: () => options.data?.P.active !== "sendgrid",
            }),
          },
          getErrorSchema(
            "sendGridApiKey",
            `return \`._id {color: \${args.theme.var.color.error}; margin-top: -20px;}\`;`,
          ),
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
                componentName: "SystemTextInput",
                key: "fromEmail",
                placeholder: "Enter from email address",
                type: "email",
                validate: (value: string, data: Record<string, unknown>) => {
                  if (data.P && !(data.P as EmailSettingsData).active) {
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
            props: (options: EmailSettingsFunctionArgumentType) => ({
              hide: () => !options.data?.P.active,
            }),
          },
          getErrorSchema(
            "fromEmail",
            `return \`._id {color: \${args.theme.var.color.error}; margin-top: -20px;}\`;`,
          ),
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
                componentName: "SystemTextInput",
                css: [PROPERTIES.Css.CheckBoxCss],
                type: "checkbox",
                key: "secure",
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
            props: (options: EmailSettingsFunctionArgumentType) => ({
              hide: () => options.data?.P.active !== "smtp",
            }),
          },
          getErrorSchema(
            "secure",
            `return \`._id {color: \${args.theme.var.color.error}; margin-top: -20px;}\`;`,
          ),
          {
            as: "div",
            attributes: [
              {
                attributes: [
                  {
                    as: "button",
                    css: SETTINGS_CONSTANTS.SAVE_BUTTON_CSS,
                    componentName: "Html",
                    props: (options: EmailSettingsFunctionArgumentType) => ({
                      disabled: options.contextData.saveState[0]?.isLoading,
                      onClick: async () => {
                        // Validate form data
                        const settings = options.data;
                        const errors = validateFormData(
                          settings.P as EmailSettingsData,
                        );

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
                            options.contextData.saveState[1](
                              "isLoading",
                              isLoading,
                            ),
                          showSuccessToast,
                          showErrorToast,
                        );
                      },
                      text: options.contextData.saveState[0]?.isLoading
                        ? "Saving..."
                        : "Save Changes",
                    }),
                  },
                ],
                componentName: "Html",
                contextName: "saveState",

                props: () => ({
                  data: createStore({
                    isLoading: false,
                  }),
                }),
              },
            ],
            css: `return \`._id {
  margin-top: 24px;
  display: flex;
  gap: 1rem;
}\`;`,
            componentName: "Html",
          },
        ],
        css: SETTINGS_CONSTANTS.FORM_CSS,
        componentName: "Html",
      },
    ],
    componentName: "Html",
    props: (options: FunctionArgumentType) => ({
      onCleanup: () => {
        options.revertTransactionUpToIndex(options.txnId, -1);
      },
    }),
  };

  // Test email form
  const testEmailForm = {
    as: "div",
    attributes: [
      {
        as: "h3",
        css: `return \`._id {
  font-size: 1.125rem;
  font-weight: 600;
  color: \${args.theme.var.color.text};
  margin-bottom: 0.5rem;
  margin-top: 2rem;
}\`;`,
        componentName: "Html",
        text: "Test Email",
      },
      {
        as: "p",
        css: `return \`._id {
  font-size: 0.875rem;
  color: \${args.theme.var.color.text_dark_300};
  margin-bottom: 1.5rem;
}\`;`,
        componentName: "Html",
        text: "Send a test email to verify your email configuration is working correctly.",
      },
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
                text: "To Email",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "SystemTextInput",
                key: "toEmail",
                placeholder: "recipient@example.com",
                type: "email",
                validate: (value: string) => {
                  if (!value || value.trim() === "") {
                    return "Email address is required";
                  }
                  return validateEmail(value);
                },
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
          },
          getErrorSchema(
            "toEmail",
            `return \`._id {color: \${args.theme.var.color.error}; margin-top: -20px;}\`;`,
          ),
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "Email Content",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "SystemTextInput",
                key: "emailContent",
                placeholder: "Enter test email content",
                props: () => ({
                  as: "textarea",
                  rows: 4,
                }),
                validate: (value: string) => {
                  if (!value || value.trim() === "") {
                    return "Email content is required";
                  }
                  return undefined;
                },
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
          },
          getErrorSchema(
            "emailContent",
            `return \`._id {color: \${args.theme.var.color.error}; margin-top: -20px;}\`;`,
          ),
          {
            as: "div",
            attributes: [
              {
                attributes: [
                  {
                    as: "button",
                    css: SETTINGS_CONSTANTS.SAVE_BUTTON_CSS,
                    componentName: "Html",
                    props: (options: EmailSettingsFunctionArgumentType) => ({
                      disabled: options.contextData.testEmailState[0]?.isLoading,
                      onClick: async () => {
                        try {
                          options.contextData.testEmailState[1]("isLoading", true);
                          const testData = options.data;

                          // Validate test email data
                          const toEmailError = testData.P.toEmail
                            ? validateEmail(testData.P.toEmail)
                            : "Email address is required";
                          const contentError =
                            !testData.P.emailContent ||
                            testData.P.emailContent.trim() === ""
                              ? "Email content is required"
                              : undefined;

                          if (toEmailError) {
                            options.setError(toEmailError, "toEmail");
                            showErrorToast("Please fix the validation errors");
                            return;
                          }

                          if (contentError) {
                            options.setError(contentError, "emailContent");
                            showErrorToast("Please fix the validation errors");
                            return;
                          }

                          options.clearAllErrors();

                          // Send test email
                          await handleApiRequest(
                            API.settings.email.testUrl,
                            {
                              toEmail: testData.P.toEmail,
                              content: testData.P.emailContent,
                            },
                            "Test email sent successfully",
                            () => {},
                            showSuccessToast,
                            showErrorToast,
                          );
                        } catch (error) {
                          showErrorToast((error as Error).message);
                        } finally {
                          options.contextData.testEmailState[1]("isLoading", false);
                        }
                      },
                      text: options.contextData.testEmailState[0]?.isLoading
                        ? "Sending..."
                        : "Send Test Email",
                    }),
                  },
                ],
                componentName: "Html",
                contextName: "testEmailState",

                props: () => ({
                  data: createStore({
                    isLoading: false,
                  }),
                }),
              },
            ],
            css: `return \`._id {
  margin-top: 24px;
}\`;`,
            componentName: "Html",
          },
        ],
        css: SETTINGS_CONSTANTS.FORM_CSS,
        componentName: "Html",
      },
    ],
    componentName: "Html",
    props: (options: FunctionArgumentType) => ({
      onCleanup: () => {
        options.revertTransactionUpToIndex(options.txnId, -1);
      },
    }),
  };

  return (
    <div>
      <SchemaRenderer
        form={{ attributes: [form], key: "EmailSettings" }}
        getFormData={loadSettingsData}
      />
      <SchemaRenderer
        form={{ attributes: [testEmailForm], key: "TestEmail" }}
      />
    </div>
  );
}
