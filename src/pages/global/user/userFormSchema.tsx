import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { Vertex } from "~/lib/graph/graph";
import type {
  FieldAttribute,
  IFormMetaData,
} from "~/lib/meta/FormMetadataType";

import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";
import { evalExpression } from "~/lib/expression_eval";
import { validateEmail } from "~/lib/validation/validateEmail";
import { validateUsername } from "~/lib/validation/validateUsername";
import { PROPERTIES, SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { addEditButtonSchema } from "~/pages/subdomain/functions/addEditButtonSchema";

export const userFormSchema = {
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
              as: "span", componentName: "Html",
              text: "Email",
              validation: { required: true },
            },
            {
              class: PROPERTIES.Css.TextField,
              componentName: "TextInput",
              key: "email",
              placeholder: "Enter email",
              validation: {
                required: true,
                validate: validateEmail,
              },
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
              as: "span", componentName: "Html",
              text: "Name",
            },
            {
              class: PROPERTIES.Css.TextField,
              componentName: "TextInput",
              key: "name",
              placeholder: "Enter name",
              validation: {
                regex: [
                  {
                    enabled: true,
                    message:
                      "Name must be between 2 and 100 characters and contain only letters, spaces, and hyphens",
                    value: "^[a-zA-Z\\s-]{2,100}$",
                  },
                ],
                required: true,
              },
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
              as: "span", componentName: "Html",
              text: "Username",
            },
            {
              class: PROPERTIES.Css.TextField,
              componentName: "TextInput",
              key: "username",
              placeholder: "Enter username",
              validation: {
                required: true,
                validate: validateUsername,
              },
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
              as: "span", componentName: "Html",
              text: "Role",
            },
            {
              collection: "g:'Role'",
              componentName: "MultiSelect",
              key: "role",
              placeholder: "Select roles",
              validation: { required: true },
            },
          ],
          class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
          componentName: "Html",
        },
      ],
      class: SETTINGS_CONSTANTS.FORM_CLASS,
      componentName: "Html",
    },
  ],
  componentName: "Html",
} as FieldAttribute;

export const getUserFormSchema = (onSuccess: () => void) => {
  const { showErrorToast, showSuccessToast } = useToast();

  const validateForm = (options: FunctionArgumentType) => {
    const formData = options.data;
    if (!formData.P.email?.trim()) {
      showErrorToast("Please enter email");
      return false;
    }
    const emailError = validateEmail(formData.P.email);
    if (emailError) {
      showErrorToast(emailError);
      return false;
    }
    if (!formData.P.name?.trim()) {
      showErrorToast("Please enter name");
      return false;
    }
    if (!formData.P.username?.trim()) {
      showErrorToast("Please enter username");
      return false;
    }
    const usernameError = validateUsername(formData.P.username);
    if (usernameError) {
      showErrorToast(usernameError);
      return false;
    }
    if ((evalExpression("->$0Role", {
      graph: options.graph,
      setGraph: options.setGraph,
      vertexes: [formData],
    }) as Vertex[]).length === 0) {
      showErrorToast("Please select at least one role");
      return false;
    }
    return true;
  };

  const handleSave = async (options: FunctionArgumentType) => {
    if (!validateForm(options)) {
      return;
    }
    const formData = options.data;

    try {
      options.dataContext.modalState[1]("isLoading", true);

      const roles =
        (evalExpression("->$0Role", {
          graph: options.graph,
          setGraph: options.setGraph,
          vertexes: [formData],
        }) as Vertex[]) || [];

      const url = formData.id.startsWith("-")
        ? API.user.inviteUserUrl
        : API.user.updateUserUrl;
      const response = await postAPI(url, {
        email: formData.P.email,
        name: formData.P.name,
        roles: roles.map((role) => role.id),
        username: formData.P.username,
        uuid: formData.P.uuid,
      });

      if (response.error) {
        showErrorToast(response.error);
      } else {
        showSuccessToast(
          formData.id.startsWith("-")
            ? "User invited successfully"
            : "User updated successfully",
        );
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
        class: SETTINGS_CONSTANTS.MODAL.HEADER.TEXT_CLASS,
        as: "span", componentName: "Html",
        text: "Add New User",
      },
    ],
    class: SETTINGS_CONSTANTS.MODAL.HEADER.CLASS,
    componentName: "Html",
  };

  const modalFooterSchema = {
    as: "div",
    attributes: [
      {
        as: "button",
        class: SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CLASS,
        componentName: "Html",
        props: (options: FunctionArgumentType) => ({
          disabled: options.dataContext.modalState[0]?.isLoading,
          onClick: () => handleSave(options),
          text: options.dataContext.modalState[0]?.isLoading
            ? "Saving..."
            : "Save",
        }),
        type: "button",
      },
      {
        as: "button",
        class: SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CLASS,
        componentName: "Html",
        props: (options: FunctionArgumentType) => ({
          onClick: () => {
            options.dataContext.modalState[1]("showModal", false);
          },
          text: "Cancel",
        }),
        type: "button",
      },
    ],
    class: SETTINGS_CONSTANTS.MODAL.FOOTER.CLASS,
    componentName: "Html",
  };

  const schema = {
    attributes: [
      {
        as: "div",
        attributes: [
          addEditButtonSchema("User"),
          {
            attributes: [
              {
                attributes: [
                  {
                    as: "div",
                    attributes: [],
                    class: SETTINGS_CONSTANTS.MODAL.OVERLAY_CLASS,
                    componentName: "Html",
                    props: (options: FunctionArgumentType) => ({
                      hidden: !options.dataContext.modalState[0]?.showModal,
                      style: {
                        "z-index": options.zIndex,
                      },
                    }),
                  },
                  {
                    as: "dialog",
                    attributes: [
                      {
                        attributes: [
                          modalHeaderSchema,
                          userFormSchema,
                          modalFooterSchema,
                        ],
                        componentName: "Form",
                        props: (options: FunctionArgumentType) => ({
                          formDataId: options.data.id,
                        }),
                      },
                    ],
                    class: SETTINGS_CONSTANTS.MODAL.CONTAINER_CLASS,
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
                  hidden: !options.dataContext.modalState[0]?.showModal,
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
      // TODO: if not saved, revert to previous state
      // onUnmount: () => {
      //   options.revertTransactionUpToIndex(options.txnId, -1);
      // }
    }),
  };

  return { attributes: [schema], key: "User" } as IFormMetaData;
};
