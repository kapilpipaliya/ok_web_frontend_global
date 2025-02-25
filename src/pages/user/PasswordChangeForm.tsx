import { useNavigate } from "@solidjs/router";
import { createStore, type SetStoreFunction, type Store } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { PROPERTIES } from "~/components/styled/constants/constant";
import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { getErrorMessage } from "~/lib/api/getErrorMessage";
import { postAPI } from "~/lib/api/postApi";
import { getMemberVertex } from "~/lib/graph/get/sync/getMemberVertex";
import { type GraphInterface, useGraph, type Vertex } from "~/lib/graph/graph";
import { validatePassword } from "~/lib/validation/validatePassword";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

import { SchemaRenderer } from "../SchemaRenderer";

export function PasswordChangeForm() {
  const [graph] = useGraph();
  const navigate = useNavigate();
  const { showErrorToast, showSuccessToast } = useToast();

  const [showPassword, setShowPassword] = createStore({
    confirmPassword: false,
    currentPassword: false,
    newPassword: false,
  });

  const form = {
    as: "div",
    attributes: [
      createPasswordField(
        "Current Password",
        "currentPassword",
        showPassword,
        setShowPassword,
      ),
      createPasswordField(
        "New Password",
        "newPassword",
        showPassword,
        setShowPassword,
      ),
      createPasswordField(
        "Confirm New Password",
        "confirmPassword",
        showPassword,
        setShowPassword,
        "Confirm New Password",
      ),
      {
        as: "div",
        attributes: [
          {
            attributes: [
              {
                as: "button",
                class:
                  "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none mr:8",
                componentName: "Box",
                props: (options: FunctionArgumentType) => ({
                  disabled: options.dataContext.saveState[0]?.isLoading,
                  onClick: async () => {
                    const formData = options.data;
                    if (validateFormData(formData, showErrorToast)) {
                      try {
                        options.dataContext.saveState[1]("isLoading", true);
                        await handlePasswordChange(
                          formData,
                          graph,
                          showErrorToast,
                          showSuccessToast,
                        );
                        // Redirect to login page as session is expired
                        navigate?.("/auth/login");
                      } finally {
                        options.dataContext.saveState[1]("isLoading", false);
                      }
                    }
                  },
                  text: options.dataContext.saveState[0]?.isLoading
                    ? "Saving..."
                    : "Change Password",
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
  } as FieldAttribute;

  return (
    <SchemaRenderer form={{ attributes: [form], key: "PasswordChange" }} />
  );
}

function createPasswordField(
  label: string,
  key: string,
  showPassword: Store<{ [key: string]: boolean }>,
  setShowPassword: SetStoreFunction<{ [key: string]: boolean }>,
  placeholder?: string,
) {
  return {
    as: "div",
    attributes: [
      {
        class: SETTINGS_CONSTANTS.LABEL_CLASS,
        componentName: "Text",
        text: label,
      },
      {
        as: "div",
        attributes: [
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextInput",
            key,
            placeholder: placeholder || `Enter ${label.toLowerCase()}`,
            props: () => ({
              type: showPassword[key] ? "text" : "password",
            }),
            validation: { required: true },
          },
          {
            as: "div",
            attributes: [
              {
                componentName: "Icon",
                props: () => ({
                  icon: showPassword[key] ? "ph:eye" : "ph:eye-slash",
                  onClick: () => setShowPassword(key, !showPassword[key]),
                }),
              },
            ],
            class:
              "position:abs right:10px top:50% transform:translateY(-50%) cursor:pointer",
            componentName: "Box",
          },
        ],
        class: "position:rel",
        componentName: "Box",
      },
    ],
    class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS,
    componentName: "Box",
  };
}

async function handlePasswordChange(
  formData: Vertex,
  graph: GraphInterface,
  showErrorToast: (msg: string) => void,
  showSuccessToast: (msg: string) => void,
) {
  try {
    const response = await postAPI(API.auth.changePasswordUrl, {
      currentPassword: formData.P.currentPassword,
      newPassword: formData.P.newPassword,
      uuid: getMemberVertex(graph)?.P.uuid,
    });

    if (response.error) {
      showErrorToast(response.error);
    } else {
      showSuccessToast("Password changed successfully");
    }
  } catch (error) {
    showErrorToast(getErrorMessage(error));
  }
}

function validateFormData(
  formData: Vertex,
  showErrorToast: (msg: string) => void,
) {
  const { confirmPassword, currentPassword, newPassword } = formData.P;

  if (!currentPassword?.trim()) {
    showErrorToast("Please enter current password");
    return false;
  }
  if (!newPassword?.trim()) {
    showErrorToast("Please enter new password");
    return false;
  }
  if (!confirmPassword?.trim()) {
    showErrorToast("Please enter confirm password");
    return false;
  }

  const currentPasswordError = validatePassword(currentPassword);
  if (currentPasswordError) {
    showErrorToast(`Current ${currentPasswordError}`);
    return false;
  }
  const newPasswordError = validatePassword(newPassword);
  if (newPasswordError) {
    showErrorToast(`New ${newPasswordError}`);
    return false;
  }
  if (newPassword.trim() !== confirmPassword.trim()) {
    showErrorToast("New and confirm passwords don't match");
    return false;
  }
  if (currentPassword.trim() === newPassword.trim()) {
    showErrorToast("New password can't be the same as current password");
    return false;
  }

  return true;
}
