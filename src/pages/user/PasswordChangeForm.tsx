import { createStore, type SetStoreFunction, type Store } from "solid-js/store";
import { v7 as uuidv7 } from "uuid";

import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { PROPERTIES } from "~/components/styled/constants/constant";
import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { getErrorMessage } from "~/lib/api/getErrorMessage";
import { postAPI } from "~/lib/api/postApi";
import { getMemberVertex } from "~/lib/graph/get/sync/getMemberVertex";
import { type GraphInterface, useGraph, type Vertex } from "~/lib/graph/graph";
import { addNewVertex } from "~/lib/graph/mutate/vertex";
import { validatePassword } from "~/lib/validation/validatePassword";

import { SchemaRenderer } from "../SchemaRenderer";

const GRID_ITEM_CLASS =
  "grid grid-template-columns:200px|400px ai:center gap:8";
const LABEL_CLASS = "color:dimgrey font-weight:500 font:15";

export function PasswordChangeForm() {
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showSuccessToast } = useToast();

  const [showPassword, setShowPassword] = createStore({
    confirmPassword: false,
    currentPassword: false,
    newPassword: false,
  });

  const formDataId = uuidv7();
  addNewVertex(
    0,
    {
      id: formDataId,
      IN: {},
      L: ["PasswordChange"],
      OUT: {},
      P: {},
    },
    graph,
    setGraph,
  );

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
      ),
      {
        as: "div",
        attributes: [
          {
            as: "button",
            class:
              "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none mr:8",
            componentName: "Box",
            props: () => ({
              onClick: async () => {
                const formData = graph.vertexes[formDataId];
                if (validateFormData(formData, showErrorToast)) {
                  await handlePasswordChange(
                    formData,
                    graph,
                    showErrorToast,
                    showSuccessToast,
                  );
                }
              },
            }),
            text: "Change Password",
          },
        ],
        class: "mt:24",
        componentName: "Box",
      },
    ],
    class: "p:10 grid gap:10",
    componentName: "Box",
  } as FieldAttribute;

  return (
    <SchemaRenderer
      form={{ attributes: [form], key: "PasswordChange" }}
      formDataId={formDataId}
    />
  );
}

function createPasswordField(
  label: string,
  key: string,
  showPassword: Store<{ [key: string]: boolean }>,
  setShowPassword: SetStoreFunction<{ [key: string]: boolean }>,
) {
  return {
    as: "div",
    attributes: [
      {
        class: LABEL_CLASS,
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
            placeholder: `Enter ${label.toLowerCase()}`,
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
                  icon: showPassword[key]
                    ? "iconamoon:eye-light"
                    : "iconamoon:eye-off",
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
    class: GRID_ITEM_CLASS,
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
    const response = await postAPI(API.changePasswordUrl, {
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
