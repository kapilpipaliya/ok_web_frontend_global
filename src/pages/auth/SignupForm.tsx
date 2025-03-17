import { useNavigate } from "@solidjs/router";
import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { Vertex } from "~/lib/graph/graph";

import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { getErrorSchema } from "~/lib/schema/getErrorSchema";
import { getPasswordLabelWithHintSchema } from "~/lib/schema/passwordHintPopover";
import { wrapFormInCard } from "~/lib/schema/wrapFormInCard";
import { validatePassword } from "~/lib/validation/validatePassword";

import { SchemaRenderer } from "../SchemaRenderer";
import { PROPERTIES, SETTINGS_CONSTANTS, STYLES } from "../settings/constants";
// Import all utilities from the index file
import { createFormHeader, createTextField } from "./functions/formComponents";
import { useFormRefs } from "./functions/useFormRefs";
import { useFormSubmit } from "./functions/useFormSubmit";
import { usePasswordVisibility } from "./functions/usePasswordVisibility";
import { validateFormData } from "./functions/validateFormData";

export function SignupForm() {
  const navigate = useNavigate();

  // Use our utility hooks
  const [showPassword, toggleVisibility] = usePasswordVisibility(["password"]);
  const [formRefs, setRef] = useFormRefs(["emailRef", "passwordRef"]);
  const { showErrorToast, submitForm } = useFormSubmit();

  // Validation function using our utility
  const validateSignupData = (formData: Vertex) => {
    return validateFormData(formData, showErrorToast, {
      requireEmail: true,
      requirePassword: true,
      requireUsername: true,
    });
  };

  // Submit handler using our utility
  const handleSubmit = async (formData: Vertex) => {
    await submitForm(formData, {
      apiCall: (data) =>
        postAPI(API.auth.signUpUrl, {
          email: data.P.email.toLowerCase(),
          password: data.P.password,
          subDomain: data.P.subDomain,
          username: data.P.username.toLowerCase(),
        }),
      loadMessage: "Registering User...",
      navigate,
      shouldRedirect: true,
      successMessage: "Registered Successfully",
      validateFn: validateSignupData,
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
  const handleEmailEnter = () => {
    // Focus password field when Enter is pressed in email field
    if (formRefs.passwordRef) {
      formRefs.passwordRef.focus();
    }
  };

  // Username field enter key handler
  const handleUsernameEnter = () => {
    // Focus email field when Enter is pressed in username field
    if (formRefs.emailRef) {
      formRefs.emailRef.focus();
    }
  };

  const form = {
    as: "div",
    attributes: [
      // Use our utility for form header
      ...createFormHeader("Sign Up"),
      {
        attributes: [
          {
            attributes: [
              // Use our utility for text fields
              ...createTextField(
                "username",
                "Username",
                handleUsernameEnter,
                undefined,
                {
                  minLength: 4,
                  required: true,
                },
              ),
              ...createTextField(
                "email",
                "Email",
                handleEmailEnter,
                (ref) => setRef("emailRef", ref),
                {
                  email: true,
                  required: true,
                },
              ),
              // Use our utility for password field with hint
              getPasswordLabelWithHintSchema("Password", "password"),
              {
                as: "div",
                attributes: [
                  {
                    class: PROPERTIES.Css.TextField,
                    componentName: "TextInput",
                    key: "password",
                    props: (options: FunctionArgumentType) => ({
                      onInput: (e: Event) => {
                        if (e.target instanceof HTMLInputElement) {
                          options.updateValue(e.target.value);
                        }
                      },
                      onKeyDown: async (e: KeyboardEvent) => {
                        if (e.key === "Enter") {
                          if (e.target instanceof HTMLInputElement) {
                            options.updateValue(e.target.value);
                          }
                          if (options.dataContext.submitState[0]?.isLoading) {
                            return;
                          }
                          handlePasswordEnter(options);
                        }
                      },
                      onMount: () => {
                        if (
                          options.ref &&
                          options.ref() instanceof HTMLInputElement
                        ) {
                          setRef("passwordRef", options.ref());
                        }
                      },
                      ref: (el: HTMLInputElement) => {
                        setRef("passwordRef", el);
                      },
                      type: showPassword.password ? "text" : "password",
                    }),
                    validation: {
                      minLength: 8,
                      required: true,
                      // Note: if hint is displayed, this is not needed
                      validate: validatePassword,
                    },
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
                          onClick: () => toggleVisibility("password"),
                        }),
                      },
                    ],
                    class:
                      "position:abs right:10px top:50% transform:translateY(-50%) cursor:pointer",
                    componentName: "Html",
                  },
                ],
                class: "position:rel",
                componentName: "Html",
              },
              getErrorSchema("password"),
              {
                as: "button",
                class: `${STYLES.button2} w:100% mt:16`,
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
                    ? "Signing up..."
                    : "Sign Up",
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
                text: "Already have an account? ",
              },
              {
                as: "a",
                class: "fg:primary-50 cursor:pointer",
                componentName: "Html",
                props: () => ({
                  onClick: () => {
                    navigate("/auth/login");
                  },
                }),
                text: "Login",
              },
            ],
            class: "text:center mt:16px",
            componentName: "Html",
          },
        ],
        class: SETTINGS_CONSTANTS.FORM_GRID_CLASS,
        componentName: "Html",
      },
    ],
    componentName: "Html",
  };

  return (
    <SchemaRenderer
      form={{ attributes: [wrapFormInCard(form)], key: "Signup" }}
    />
  );
}
