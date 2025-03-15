import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/general/getApi";
import { postAPI } from "~/lib/api/general/postApi";

import { SchemaRenderer } from "../../SchemaRenderer";
import { PROPERTIES, SETTINGS_CONSTANTS } from "../../settings/constants";

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
            class: SETTINGS_CONSTANTS.LABEL_CLASS,
            componentName: "Html",
            text: "Company Name",
          },
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextInput",
            key: "companyName",
            placeholder: "Enter company name",
          },
        ],
        class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
        componentName: "Html",
      },
      {
        as: "div",
        attributes: [
          {
            as: "span",
            class: SETTINGS_CONSTANTS.LABEL_CLASS,
            componentName: "Html",
            text: "Address",
          },
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextArea",
            key: "address",
            placeholder: "Enter company address",
          },
        ],
        class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
        componentName: "Html",
      },
      {
        as: "div",
        attributes: [
          {
            as: "span",
            class: SETTINGS_CONSTANTS.LABEL_CLASS,
            componentName: "Html",
            text: "Contact Email",
          },
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextInput",
            key: "contactEmail",
            placeholder: "Enter contact email",
            type: "email",
          },
        ],
        class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
        componentName: "Html",
      },
      {
        as: "div",
        attributes: [
          {
            as: "span",
            class: SETTINGS_CONSTANTS.LABEL_CLASS,
            componentName: "Html",
            text: "Phone",
          },
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextInput",
            key: "phone",
            placeholder: "Enter phone number",
          },
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
        class: "mt:24",
        componentName: "Html",
      },
    ],
    class: SETTINGS_CONSTANTS.FORM_CLASS,
    componentName: "Html",
    props: () => ({
      // TODO: if not saved, revert to previous state
      // onUnmount: () => {
      //   options.revertTransactionUpToIndex(options.txnId, -1);
      // }
    }),
  } as FieldAttribute;

  return (
    <SchemaRenderer
      form={{ attributes: [form], key: "CompanySettings" }}
      getFormData={loadSettingsData}
    />
  );
}
