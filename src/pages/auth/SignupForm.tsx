import { useNavigate } from "@solidjs/router";
import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";

import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { wrapFormInCard } from "~/lib/utils/formWrapper";
import { validateEmail } from "~/lib/validation/validateEmail";
import { validatePassword } from "~/lib/validation/validatePassword";
import { validateUsername } from "~/lib/validation/validateUsername";
import { handleLoginRedirect } from "~/pages/auth/functions/handleLoginRedirect";

import { SchemaRenderer } from "../SchemaRenderer";
import { PROPERTIES, SETTINGS_CONSTANTS } from "../settings/constants";
import { getTitleSchema } from "./functions/getTitleSchema";

export function SignupForm() {
  const [graph] = useGraph();
  const navigate = useNavigate();
  const { showErrorToast, showLoadingToast } = useToast();
  const [showPassword, setShowPassword] = createStore({
    password: false,
  });

  const validateFormData = (formData: any) => {
    const { email, password, username } = formData.P;

    const usernameError = validateUsername(username);
    if (usernameError) {
      showErrorToast(usernameError);
      return false;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      showErrorToast(emailError);
      return false;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      showErrorToast(passwordError);
      return false;
    }

    return true;
  };

  const handleSubmit = async (formData: Vertex) => {
    if (validateFormData(formData)) {
      const _globalStoreId = "globalStoreId";

      await showLoadingToast({
        loadMessage: "Registering User...",
        onError: () => {},
        onSuccess: (value) => {
          handleLoginRedirect(value?.result, graph, navigate);
        },
        promise: postAPI(API.auth.signUpUrl, {
          email: formData.P.email.toLowerCase(),
          password: formData.P.password,
          subDomain: formData.P.subDomain,
          username: formData.P.username.toLowerCase(),
        }),
        successMessage: "Registered Successfully",
      });
    }
  };

  const form = {
    as: "div",
    attributes: [
      getTitleSchema("Sign Up"),
      {
        as: "div",
        attributes: [
          {
            class: SETTINGS_CONSTANTS.LABEL_CLASS,
            componentName: "Text",
            text: "Username",
          },
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextInput",
            key: "username",
            validation: { required: true },
          },
          {
            class: SETTINGS_CONSTANTS.LABEL_CLASS,
            componentName: "Text",
            text: "Email",
          },
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextInput",
            key: "email",
            validation: { required: true },
          },
          {
            class: SETTINGS_CONSTANTS.LABEL_CLASS,
            componentName: "Text",
            text: "Password",
          },
          {
            as: "div",
            attributes: [
              {
                class: PROPERTIES.Css.TextField,
                componentName: "TextInput",
                key: "password",
                props: () => ({
                  type: showPassword.password ? "text" : "password",
                }),
                validation: { required: true },
              },
              {
                as: "div",
                attributes: [
                  {
                    componentName: "Icon",
                    props: () => ({
                      icon: showPassword.password ? "ph:eye" : "ph:eye-slash",
                      onClick: () =>
                        setShowPassword("password", !showPassword.password),
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
        class: SETTINGS_CONSTANTS.FORM_GRID_CLASS,
        componentName: "Box",
      },
      {
        attributes: [
          {
            as: "button",
            class:
              "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none mr:8 w:100%",
            componentName: "Box",
            props: (options: FunctionArgumentType) => ({
              disabled: options.dataContext.submitState[0]?.isLoading,
              onClick: async () => {
                try {
                  options.dataContext.submitState[1]("isLoading", true);
                  const formData = options.data;
                  await handleSubmit(formData);
                } finally {
                  options.dataContext.submitState[1]("isLoading", false);
                }
              },
              text: options.dataContext.submitState[0]?.isLoading
                ? "Signing up..."
                : "Sign Up",
            }),
          },
        ],
        componentName: "Data",
        name: "submitState",
        noRepeat: true,
        props: () => ({
          data: createStore({
            isLoading: false,
          }),
        }),
      },
      {
        as: "div",
        attributes: [
          {
            class: "color:grey",
            componentName: "Text",
            text: "Already have an account? ",
          },
          {
            as: "a",
            class: "color:primary text-decoration:none font-weight:bold",
            componentName: "Box",
            props: () => ({
              href: "/auth/login",
            }),
            text: "Sign In",
          },
        ],
        class: "text-align:center",
        componentName: "Box",
      },
    ],
    class: SETTINGS_CONSTANTS.FORM_CLASS,
    componentName: "Box",
  };

  return (
    <SchemaRenderer
      form={{ attributes: [wrapFormInCard(form)], key: "Signup" }}
    />
  );
}
