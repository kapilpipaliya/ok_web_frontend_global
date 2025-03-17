import { useNavigate, useSearchParams } from "@solidjs/router";
import { onMount } from "solid-js";
import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { Vertex } from "~/lib/graph/graph";

import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { wrapFormInCard } from "~/lib/schema/wrapFormInCard";

import { SchemaRenderer } from "../SchemaRenderer";
import { STYLES } from "../settings/constants";
// Import all utilities from the index file
import {
  createFormHeader,
  createPasswordField,
  createTextField,
  useFormRefs,
  useFormSubmit,
  usePasswordVisibility,
  validateFormData,
} from "./functions";

export function LoginForm() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Use our utility hooks
  const [showPassword, toggleVisibility] = usePasswordVisibility(["password"]);
  const [formRefs, setRef] = useFormRefs(["emailRef", "passwordRef"]);
  const { showErrorToast, submitForm } = useFormSubmit();

  onMount(() => {
    if (searchParams.error) {
      showErrorToast(searchParams.error as string);
      setSearchParams({ error: null }, { replace: true });
    }
  });

  // Validation function using our utility
  const validateLoginData = (formData: Vertex) => {
    return validateFormData(formData, showErrorToast, {
      allowEmailOrUsername: true,
      requireEmail: true,
      requirePassword: true,
    });
  };

  // Submit handler using our utility
  const handleSubmit = async (formData: Vertex) => {
    await submitForm(formData, {
      apiCall: (data) =>
        postAPI(API.auth.loginUrl, {
          email: data.P.email.toLowerCase(),
          password: data.P.password,
        }),
      loadMessage: "Logging In...",
      navigate,
      shouldRedirect: true,
      successMessage: "Logged In Successfully",
      validateFn: validateLoginData,
    });
  };

  // Password field enter key handler
  const handlePasswordEnter = async (options: FunctionArgumentType) => {
    try {
      options.dataContext.submitState[1]("isLoading", true);
      const formData = options.data;
      await handleSubmit(formData);
    } finally {
      options.dataContext.submitState[1]("isLoading", false);
    }
  };

  // Email field enter key handler
  const handleEmailEnter = (options: FunctionArgumentType) => {
    // Focus password field if empty
    if (!options.data.P.password && formRefs.passwordRef) {
      formRefs.passwordRef.focus();
    } else {
      handlePasswordEnter(options);
    }
  };

  const form = {
    as: "div",
    attributes: [
      // Use our utility for form header
      ...createFormHeader("Login"),
      {
        attributes: [
          {
            attributes: [
              // Use our utility for text field
              ...createTextField(
                "email",
                "Username/Email",
                handleEmailEnter,
                (ref) => setRef("emailRef", ref),
              ),
              // Use our utility for password field
              ...createPasswordField(
                "password",
                "Password",
                showPassword,
                toggleVisibility,
                handlePasswordEnter,
                (ref) => setRef("passwordRef", ref),
              ),
              {
                as: "div",
                attributes: [
                  {
                    as: "a",
                    class: "fg:primary-50 text:sm cursor:pointer",
                    componentName: "Html",
                    props: () => ({
                      onClick: () => {
                        navigate(API.urls.user.forgotPassword);
                      },
                    }),
                    text: "Forgot Password?",
                  },
                ],
                class: "text:right mb:16px",
                componentName: "Html",
              },
              {
                as: "button",
                class: `${STYLES.button2} w:100%`,
                componentName: "Html",
                props: (options: FunctionArgumentType) => ({
                  disabled: options.dataContext.submitState[0]?.isLoading,
                  onClick: async () => {
                    try {
                      options.dataContext.submitState[1]("isLoading", true);
                      await handleSubmit(options.data);
                    } finally {
                      options.dataContext.submitState[1]("isLoading", false);
                    }
                  },
                  text: options.dataContext.submitState[0]?.isLoading
                    ? "Logging in..."
                    : "Log In",
                }),
                type: "button",
              },
            ],
            componentName: "Data",
            name: "submitState",

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
                as: "span",
                class: "fg:base",
                componentName: "Html",
                text: "Don't have an account? ",
              },
              {
                as: "a",
                class: "fg:primary-50 cursor:pointer",
                componentName: "Html",
                props: () => ({
                  onClick: () => {
                    navigate("/auth/signup");
                  },
                }),
                text: "Sign Up",
              },
            ],
            class: "text:center mt:16px",
            componentName: "Html",
          },
        ],
        componentName: "Html",
      },
    ],
    componentName: "Html",
    props: (options: FunctionArgumentType) => ({
      onUnmount: () => {
        options.revertTransactionUpToIndex(options.txnId, -1);
      },
    }),
  };

  return (
    <SchemaRenderer
      form={{ attributes: [wrapFormInCard(form)], key: "Login" }}
    />
  );
}
