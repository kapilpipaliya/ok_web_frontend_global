import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { useToast } from "~/components/styled/modal/Toast";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/general/getApi";
import { postAPI } from "~/lib/api/general/postApi";

import { SchemaRenderer } from "../../SchemaRenderer";
import { PROPERTIES, SETTINGS_CONSTANTS } from "../../settings/constants";
import { css } from "~/lib/styles";

export function CompanySettings() {
  const { showErrorToast, showSuccessToast } = useToast();

  const loadSettingsData = async () => {
    return await getAPI(API.settings.company.getUrl);
  };

  const form = {
    as: "div",
    attributes: [
      {
        as: "div",
        attributes: [
          {
            as: "span",
            css: SETTINGS_CONSTANTS.LABEL_CSS,
            componentName: "Html",
            text: "Company Name",
          },
          {
            css: PROPERTIES.Css.TextFieldCss,
            componentName: "TextInput",
            key: "companyName",
            placeholder: "Enter company name",
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
            text: "Address",
          },
          {
            css: PROPERTIES.Css.TextFieldCss,
            componentName: "TextArea",
            key: "address",
            placeholder: "Enter company address",
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
            text: "Contact Email",
          },
          {
            css: PROPERTIES.Css.TextFieldCss,
            componentName: "TextInput",
            key: "contactEmail",
            placeholder: "Enter contact email",
            type: "email",
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
            text: "Phone",
          },
          {
            css: PROPERTIES.Css.TextFieldCss,
            componentName: "TextInput",
            key: "phone",
            placeholder: "Enter phone number",
          },
        ],
        css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
        componentName: "Html",
      },
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
                    try {
                      options.dataContext.saveState[1]("isLoading", true);
                      const settings = options.data;
                      const response = await postAPI(
                        API.settings.company.updateUrl,
                        settings.P,
                      );
                      if (response.error) {
                        showErrorToast(response.error);
                      } else {
                        showSuccessToast(
                          "Company details updated successfully",
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
        ],
        css: css`
  margin-top: 24px;
`,
        componentName: "Html",
      },
    ],
    css: SETTINGS_CONSTANTS.FORM_CSS,
    componentName: "Html",
    props: (options: FunctionArgumentType) => ({
      onUnmount: () => {
        options.revertTransactionUpToIndex(options.txnId, -1);
      },
    }),
  } as FieldAttribute;

  return (
    <SchemaRenderer
      form={{ attributes: [form], key: "CompanySettings" }}
      getFormData={loadSettingsData}
    />
  );
}
