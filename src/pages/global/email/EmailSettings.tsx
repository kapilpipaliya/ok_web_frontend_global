import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";

import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";
import { postAPI } from "~/lib/api/postApi";

import { SchemaRenderer } from "../../SchemaRenderer";
import { PROPERTIES, SETTINGS_CONSTANTS } from "../../settings/constants";

export function EmailSettings() {
  const { showErrorToast, showSuccessToast } = useToast();
  const loadSettingsData = async () => {
    return await getAPI(API.settings.email.getUrl);
  };

  loadSettingsData();

  const form = {
    as: "div",
    attributes: [
      {
        as: "div",
        attributes: [
          {
            as: "div",
            attributes: [
              {
                class: SETTINGS_CONSTANTS.LABEL_CLASS,
                componentName: "Text",
                text: "Email Provider",
              },
              {
                class: PROPERTIES.Css.TextField,
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
            class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
            componentName: "Html",
          },
          {
            as: "div",
            attributes: [
              {
                class: SETTINGS_CONSTANTS.LABEL_CLASS,
                componentName: "Text",
                text: "SMTP Host",
              },
              {
                class: PROPERTIES.Css.TextField,
                componentName: "TextInput",
                key: "smtpHost",
                placeholder: "Enter SMTP host",
              },
            ],
            class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
            componentName: "Html",
            props: (options: FunctionArgumentType) => ({
              hidden: () => options.data.P.active !== "smtp",
            }),
          },
          {
            as: "div",
            attributes: [
              {
                class: SETTINGS_CONSTANTS.LABEL_CLASS,
                componentName: "Text",
                text: "SMTP Port",
              },
              {
                class: PROPERTIES.Css.TextField,
                componentName: "TextInput",
                key: "smtpPort",
                placeholder: "Enter SMTP port",
                type: "number",
              },
            ],
            class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
            componentName: "Html",
            props: (options: FunctionArgumentType) => ({
              hidden: () => options.data.P.active !== "smtp",
            }),
          },
          {
            as: "div",
            attributes: [
              {
                class: SETTINGS_CONSTANTS.LABEL_CLASS,
                componentName: "Text",
                text: "SMTP Username",
              },
              {
                class: PROPERTIES.Css.TextField,
                componentName: "TextInput",
                key: "smtpUsername",
                placeholder: "Enter SMTP username",
              },
            ],
            class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
            componentName: "Html",
            props: (options: FunctionArgumentType) => ({
              hidden: () => options.data.P.active !== "smtp",
            }),
          },
          {
            as: "div",
            attributes: [
              {
                class: SETTINGS_CONSTANTS.LABEL_CLASS,
                componentName: "Text",
                text: "SMTP Password",
              },
              {
                class: PROPERTIES.Css.TextField,
                componentName: "TextInput",
                key: "smtpPassword",
                placeholder: "Enter SMTP password",
                type: "password",
              },
            ],
            class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
            componentName: "Html",
            props: (options: FunctionArgumentType) => ({
              hidden: () => options.data.P.active !== "smtp",
            }),
          },
          {
            as: "div",
            attributes: [
              {
                class: SETTINGS_CONSTANTS.LABEL_CLASS,
                componentName: "Text",
                text: "SendGrid API Key",
              },
              {
                class: PROPERTIES.Css.TextField,
                componentName: "TextInput",
                key: "sendGridApiKey",
                placeholder: "Enter SendGrid API key",
                type: "password",
              },
            ],
            class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
            componentName: "Html",
            props: (options: FunctionArgumentType) => ({
              hidden: () => options.data.P.active !== "sendgrid",
            }),
          },
          {
            as: "div",
            attributes: [
              {
                class: SETTINGS_CONSTANTS.LABEL_CLASS,
                componentName: "Text",
                text: "From Email",
              },
              {
                class: PROPERTIES.Css.TextField,
                componentName: "TextInput",
                key: "fromEmail",
                placeholder: "Enter from email address",
                type: "email",
              },
            ],
            class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
            componentName: "Html",
            props: (options: FunctionArgumentType) => ({
              hidden: () => !options.data.P.active,
            }),
          },
          {
            as: "div",
            attributes: [
              {
                class: SETTINGS_CONSTANTS.LABEL_CLASS,
                componentName: "Text",
                text: "Use Secure Connection",
              },
              {
                componentName: "CheckBox",
                key: "secure",
              },
            ],
            class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
            componentName: "Html",
            props: (options: FunctionArgumentType) => ({
              hidden: () => options.data.P.active !== "smtp",
            }),
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
                          options.dataContext.saveState[1]("isLoading", true);
                          const settings = options.data;
                          const response = await postAPI(
                            API.settings.email.updateUrl,
                            settings.P,
                          );
                          if (response.error) {
                            showErrorToast(response.error);
                          } else {
                            showSuccessToast(
                              "Email settings updated successfully",
                            );
                          }
                        } catch (error) {
                          showErrorToast((error as Error).message);
                        } finally {
                          options.dataContext.saveState[1]("isLoading", false);
                        }
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
                    class: SETTINGS_CONSTANTS.SECONDARY_BUTTON_CLASS,
                    componentName: "Html",
                    props: (options: FunctionArgumentType) => ({
                      disabled: options.dataContext.testState[0]?.isLoading,
                      onClick: async () => {
                        try {
                          options.dataContext.testState[1]("isLoading", true);
                          const settings = options.data;
                          const response = await postAPI(
                            API.settings.email.testUrl,
                            settings.P,
                          );
                          if (response.error) {
                            showErrorToast(response.error);
                          } else {
                            showSuccessToast("Test email sent successfully");
                          }
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
            class: "mt:24",
            componentName: "Html",
          },
        ],
        class: SETTINGS_CONSTANTS.FORM_CLASS,
        componentName: "Html",
      },
    ],
    componentName: "Fragment",
    props: () => ({
      // TODO: if not saved, revert to previous state
      // onUnmount: () => {
      //   options.revertTransactionUpToIndex(options.txnId, -1);
      // }
    }),
  };

  return (
    <SchemaRenderer
      form={{ attributes: [form], key: "EmailSettings" }}
      getFormData={loadSettingsData}
    />
  );
}
