import { useNavigate } from "@solidjs/router";
import { createStore } from "solid-js/store";
import { v7 as uuidv7 } from "uuid";

import { PROPERTIES } from "~/components/styled/constants/constant";
import { useToast } from "~/components/styled/Toast";
import { registerUserCall } from "~/lib/api/service/user/registerUserCall";
import { useGraph } from "~/lib/graph/graph";
import { addNewVertex, mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import { wrapFormInCard } from "~/lib/utils/formWrapper";
import { validateEmail } from "~/lib/validation/validateEmail";
import { validatePassword } from "~/lib/validation/validatePassword";
import { validateUsername } from "~/lib/validation/validateUsername";
import { handleLoginRedirect } from "~/pages/form/handleLoginRedirect";

import { SchemaRenderer } from "../../routes/admin/SchemaRenderer";
import { FORM_CLASS, FORM_GRID_CLASS, GRID_ITEM_CLASS, LABEL_CLASS } from "./constants/constant";

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
    const { email, password, subDomain, username } = formData.P;

    if (!subDomain?.trim()) {
      showErrorToast("Enter subdomain");
      return false;
    }

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

  const handleSubmit = async (formData: any) => {
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
        promise: registerUserCall(() => ({ ...formData.P, loginType: "signup" })),
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
            class: LABEL_CLASS,
            componentName: "Text",
            text: "Subdomain",
          },
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextInput",
            key: "subDomain",
            validation: { required: true },
          },
          {
            class: LABEL_CLASS,
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
            class: LABEL_CLASS,
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
                      icon: showPassword.password ? "iconamoon:eye-light" : "iconamoon:eye-off",
                      onClick: () => setShowPassword("password", !showPassword.password)
                    })
                  }
                ],
                class: "position:abs right:10px top:50% transform:translateY(-50%) cursor:pointer",
                componentName: "Box"
              }
            ],
            class: "position:rel",
            componentName: "Box"
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
            class: "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none mr:8 w:100%",
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
    class: FORM_CLASS,
    componentName: "Box",
  };

  return (
    <SchemaRenderer 
      form={{ attributes: [wrapFormInCard(form)], key: "Signup" }} 
      formDataId={formDataId} 
    />
  );
} 