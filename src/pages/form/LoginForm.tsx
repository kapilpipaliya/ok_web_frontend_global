import { useNavigate } from "@solidjs/router";
import { createStore } from "solid-js/store";
import { v7 as uuidv7 } from "uuid";

import { PROPERTIES } from "~/components/styled/constants/constant";
import { useToast } from "~/components/styled/Toast";
import { signInCall } from "~/lib/api/service/user/signInCall";
import { useGraph } from "~/lib/graph/graph";
import { addNewVertex, mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import { wrapFormInCard } from "~/lib/utils/formWrapper";
import { validateEmail } from "~/lib/validation/validateEmail";
import { validatePassword } from "~/lib/validation/validatePassword";
import { validateUsername } from "~/lib/validation/validateUsername";
import { handleLoginRedirect } from "~/pages/form/handleLoginRedirect";

import { SchemaRenderer } from "../SchemaRenderer";
import { FORM_CLASS, FORM_GRID_CLASS, LABEL_CLASS } from "./constants/constant";

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

  const handleSubmit = async (formData: any) => {
    if (validateFormData(formData)) {
      const globalStoreId = "globalStoreId";
      mergeVertexProperties(0, globalStoreId, graph, setGraph, {
        isLoadingPage: true,
      });

      await showLoadingToast({
        loadMessage: "Logging In...",
        onError: () => {
          mergeVertexProperties(0, globalStoreId, graph, setGraph, {
            isLoadingPage: false,
          });
        },
        onSuccess: (value) => {
          mergeVertexProperties(0, globalStoreId, graph, setGraph, {
            isLoadingPage: false,
          });
          handleLoginRedirect(value, graph, navigate);
        },
        promise: signInCall(() => ({ ...formData.P, loginType: "login" })),
        successMessage: "Logged In Successfully",
      });
    }
  };

  const form = {
    as: "div",
    attributes: [
      {
        as: "div",
        attributes: [
          {
            class: LABEL_CLASS,
            componentName: "Text",
            text: "Username/Email",
          },
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextInput",
            key: "email",
            validation: { required: true },
          },
          {
            class: LABEL_CLASS,
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
                      icon: showPassword.password
                        ? "iconamoon:eye-light"
                        : "iconamoon:eye-off",
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
        class: FORM_GRID_CLASS,
        componentName: "Box",
      },
      {
        as: "div",
        attributes: [
          {
            as: "button",
            class:
              "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none mr:8 w:100%",
            componentName: "Box",
            props: () => ({
              onClick: async () => {
                const formData = graph.vertexes[formDataId];
                await handleSubmit(formData);
              },
            }),
            text: "Log In",
          },
        ],
        class: "",
        componentName: "Box",
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
    class: FORM_CLASS,
    componentName: "Box",
  };

  return (
    <SchemaRenderer
      form={{ attributes: [wrapFormInCard(form)], key: "Login" }}
      formDataId={formDataId}
    />
  );
}
