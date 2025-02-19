import { useNavigate } from "@solidjs/router";
import { createStore } from "solid-js/store";
import { v7 as uuidv7 } from "uuid";

import { PROPERTIES } from "~/components/styled/constants/constant";
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
import { SETTINGS_CONSTANTS } from "../settings/constants";

export function SignupForm() {
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
      L: ["Signup"],
      OUT: {},
      P: {},
    },
    graph,
    setGraph,
  );

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
      const globalStoreId = "globalStoreId";
      mergeVertexProperties(0, globalStoreId, graph, setGraph, {
        isLoadingPage: true,
      });

      await showLoadingToast({
        loadMessage: "Registering User...",
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
        promise: postAPI(API.signUpUrl, {
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
            text: "Sign Up",
          },
        ],
        class: "",
        componentName: "Box",
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
      formDataId={formDataId}
    />
  );
}
