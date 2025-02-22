import { FunctionArgumentType } from "~/components/form/FieldSchemaType";
import { PROPERTIES } from "~/components/styled/constants/constant";
import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";
import { postAPI } from "~/lib/api/postApi";
import { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { SchemaRenderer } from "../../SchemaRenderer";
import { SETTINGS_CONSTANTS } from "../../settings/constants";

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
            class: SETTINGS_CONSTANTS.LABEL_CLASS,
            componentName: "Text",
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
        componentName: "Box",
      },
      {
        as: "div",
        attributes: [
          {
            class: SETTINGS_CONSTANTS.LABEL_CLASS,
            componentName: "Text",
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
        componentName: "Box",
      },
      {
        as: "div",
        attributes: [
          {
            class: SETTINGS_CONSTANTS.LABEL_CLASS,
            componentName: "Text",
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
        componentName: "Box",
      },
      {
        as: "div",
        attributes: [
          {
            class: SETTINGS_CONSTANTS.LABEL_CLASS,
            componentName: "Text",
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
                try {
                  const settings = options.data;
                  const response = await postAPI(
                    API.settings.company.updateUrl,
                    settings.P,
                  );
                  if (response.error) {
                    showErrorToast(response.error);
                  } else {
                    showSuccessToast("Company details updated successfully");
                  }
                } catch (error) {
                  showErrorToast((error as Error).message);
                }
              },
            }),
            text: "Save Changes",
          },
        ],
        class: "mt:24",
        componentName: "Box",
      },
    ],
    class: SETTINGS_CONSTANTS.FORM_CLASS,
    componentName: "Box",
    key: "CompanySettings"
  } as IFormMetaData;

  return (
    <SchemaRenderer
      form={form}
      getFormData={loadSettingsData}
    />
  );
}
