import { v7 as uuidv7 } from "uuid";

import { FunctionArgumentType } from "~/components/form/FieldSchemaType";
import { PROPERTIES } from "~/components/styled/constants/constant";
import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";
import { postAPI } from "~/lib/api/postApi";
import { useGraph } from "~/lib/graph/graph";
import {
  addNewVertex,
  replaceVertexProperties,
} from "~/lib/graph/mutate/vertex";

import { SchemaRenderer } from "../../SchemaRenderer";
import { SETTINGS_CONSTANTS } from "../../settings/constants";

export function EmailSettings() {
  const {showErrorToast, showSuccessToast} = useToast();
  const loadSettingsData = async () => {
    return await getAPI(API.settings.email.getUrl);
  };

  loadSettingsData();

  const form = {
    as: "div",
    attributes: [
      // {
      //   as: "div",
      //   attributes: [
      //     {
      //       class: SETTINGS_CONSTANTS.LABEL_CLASS,
      //       componentName: "Text",
      //       text: "Protocol",
      //     },
      //     {
      //       class: PROPERTIES.Css.TextField,
      //       componentName: "Select",
      //       key: "protocol",
      //       options: [
      //         { id: "smtp", label: "SMTP" },
      //         { id: "imap", label: "IMAP" },
      //       ],
      //     },
      //   ],
      //   class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
      //   componentName: "Box",
      // },
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
        componentName: "Box",
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
        componentName: "Box",
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
        componentName: "Box",
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
        componentName: "Box",
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
        componentName: "Box",
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
        componentName: "Box",
      },
      {
        as: "div",
        attributes: [
          {
            as: "button",
            class: SETTINGS_CONSTANTS.SAVE_BUTTON_CLASS,
            componentName: "Box",
            props: () => ({
              onClick: async (options: FunctionArgumentType) => {
                const settings = options.data;
                const response = await postAPI(
                  API.settings.email.updateUrl,
                  settings.P,
                );
                if (response.error) {
                  showErrorToast(response.error);
                } else {
                  showSuccessToast("Email settings updated successfully");
                }
              },
            }),
            text: "Save Changes",
          },
          {
            as: "button",
            class: SETTINGS_CONSTANTS.SECONDARY_BUTTON_CLASS,
            componentName: "Box",
            props: () => ({
              onClick: async (options: FunctionArgumentType) => {
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
              },
            }),
            text: "Test Connection",
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
      form={{ attributes: [form], key: "EmailSettings" }}
      getFormData={loadSettingsData}
    />
  );
}
