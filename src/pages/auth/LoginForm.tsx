import { useNavigate } from "@solidjs/router";
import { createStore } from "solid-js/store";
import { v7 as uuidv7 } from "uuid";

import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";

import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { addNewVertex, mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import { wrapFormInCard } from "~/lib/utils/formWrapper";
import { validateEmail } from "~/lib/validation/validateEmail";
import { validatePassword } from "~/lib/validation/validatePassword";
import { validateUsername } from "~/lib/validation/validateUsername";
import { handleLoginRedirect } from "~/pages/auth/functions/handleLoginRedirect";

import { SchemaRenderer } from "../SchemaRenderer";
import {PROPERTIES, SETTINGS_CONSTANTS} from "../settings/constants";
import { getTitleSchema } from "./functions/getTitleSchema";

export function LoginForm() {
  const [graph, setGraph] = useGraph();
  const navigate = useNavigate();
  const { showErrorToast, showLoadingToast } = useToast();
  const [showPassword, setShowPassword] = createStore({
    password: false,
  });

  const formDataId = uuidv7();
  addNewVertex(
    0,
    {
      id: formDataId,
      IN: {},
      L: ["Login"],
      OUT: {},
      P: {},
    },
    graph,
    setGraph,
  );

  const validateFormData = (formData: any) => {
    const { email, password } = formData.P;

    if (email.includes("@")) {
      const emailError = validateEmail(email);
      if (emailError) {
        showErrorToast("Enter valid email or username");
        return false;
      }
    } else {
      const usernameError = validateUsername(email);
      if (usernameError) {
        showErrorToast("Enter valid email or username");
        return false;
      }
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
      const globalStoreId = "globalStoreId";

      await showLoadingToast({
        loadMessage: "Logging In...",
        onError: () => {
        },
        onSuccess: (value) => {
          handleLoginRedirect(value, graph, navigate);
        },
        promise: postAPI(API.auth.loginUrl, {
          email: formData.P.email.toLowerCase(),
          password: formData.P.password,
        }),
        successMessage: "Logged In Successfully",
      });
    }
  };

  const form = {
    as: "div",
    attributes: [
      getTitleSchema("Login"),
      {
        attributes: [
          {
            as: "div",
            attributes: [
              {
                class: SETTINGS_CONSTANTS.LABEL_CLASS,
                componentName: "Text",
                text: "Username/Email",
              },
              {
                class: PROPERTIES.Css.TextField,
                componentName: "TextInput",
                key: "email",
                props: (options: FunctionArgumentType) => ({
                  onKeyPress: async (e: KeyboardEvent) => {
                    if (e.key === "Enter") {
                      try {
                        options.dataContext.submitState[1]("isLoading", true);
                        const formData = graph.vertexes[formDataId];
                        await handleSubmit(formData);
                      } finally {
                        options.dataContext.submitState[1]("isLoading", false);
                      }
                    }
                  },
                }),
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
                    props: (options: FunctionArgumentType) => ({
                      onKeyPress: async (e: KeyboardEvent) => {
                        if (e.key === "Enter") {
                          try {
                            options.dataContext.submitState[1](
                              "isLoading",
                              true,
                            );
                            const formData = graph.vertexes[formDataId];
                            await handleSubmit(formData);
                          } finally {
                            options.dataContext.submitState[1](
                              "isLoading",
                              false,
                            );
                          }
                        }
                      },
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
                          icon: showPassword.password
                            ? "ph:eye"
                            : "ph:eye-slash",
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
            as: "button",
            class:
              "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none mr:8 w:100%",
            componentName: "Box",
            props: (options: FunctionArgumentType) => ({
              disabled: options.dataContext.submitState[0]?.isLoading,
              onClick: async () => {
                try {
                  options.dataContext.submitState[1]("isLoading", true);
                  const formData = graph.vertexes[formDataId];
                  await handleSubmit(formData);
                } finally {
                  options.dataContext.submitState[1]("isLoading", false);
                }
              },
              text: options.dataContext.submitState[0]?.isLoading
                ? "Logging in..."
                : "Log In",
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
            as: "a",
            class: "color:primary text-decoration:none",
            componentName: "Box",
            props: () => ({
              href: "/auth/forgotPassword",
            }),
            text: "Forgot Password?",
          },
        ],
        class: "text-align:center",
        componentName: "Box",
      },
      {
        as: "div",
        attributes: [
          {
            class: "color:grey",
            componentName: "Text",
            text: "Don't have an account? ",
          },
          {
            as: "a",
            class: "color:primary text-decoration:none font-weight:bold",
            componentName: "Box",
            props: () => ({
              href: "/auth/signup",
            }),
            text: "Sign Up",
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
      form={{ attributes: [wrapFormInCard(form)], key: "Login" }}
      formDataId={formDataId}
    />
  );
}
