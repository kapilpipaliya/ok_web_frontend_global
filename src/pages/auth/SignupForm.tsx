import { useNavigate } from "@solidjs/router";
import { createAsync } from "@solidjs/router";
import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { getErrorSchema } from "~/lib/schema/getErrorSchema";
import { getPasswordLabelWithHintSchema } from "~/lib/schema/passwordHintPopover";
import { wrapFormInCard } from "~/lib/schema/wrapFormInCard";
import { validatePassword } from "~/lib/validation/validatePassword";

import { SchemaRenderer } from "../SchemaRenderer";
import { PROPERTIES, SETTINGS_CONSTANTS, STYLES } from "../settings/constants";
// Import all utilities from the index file
import { useFormRefs } from "./functions/useFormRefs";
import { useFormSubmit } from "./functions/useFormSubmit";
import { usePasswordVisibility } from "./functions/usePasswordVisibility";
import { validateFormData } from "./functions/validateFormData";
import { createFormHeader } from "~/pages/auth/functions/schema/createFormHeader";
import { createTextField } from "~/pages/auth/functions/schema/createTextField";
import type { Vertex } from "~/lib/graph/type/vertex";
import { validateUsername } from "~/lib/validation/validateUsername";
import { isGoogleOAuthEnabled } from "~/pages/global/oauth/oauthServerFunctions";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { GlobalProperties } from "~/lib/graph/context/GlobalProperties";
import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";
import { getGlobalSettingVertex } from "~/lib/graph/get/sync/store/getGlobalSettingVertex";

// Define type for submitState store
type SubmitStateStore = ReturnType<
  typeof createStore<{
    isLoading: boolean;
  }>
>;

// Define a type for function arguments with submitState in contextData
interface SignupFormFunctionArgumentType extends FunctionArgumentType {
  contextData: {
    submitState: SubmitStateStore;
    [key: string]: unknown;
  };
}

export function SignupForm() {
  const navigate = useNavigate();
  const graph = useGraph();

  // Check if Google OAuth is enabled
  const googleOAuthEnabled = createAsync(async () => {
    const response = await isGoogleOAuthEnabled();
    return response.result;
  });

  // Use our utility hooks
  const [showPassword, toggleVisibility] = usePasswordVisibility(["password"]);
  const [formRefs, setRef] = useFormRefs(["emailRef", "passwordRef"]);
  const { showErrorToast, submitForm } = useFormSubmit();

  // Function to trigger refresh of initial data
  const triggerRefresh = () => {
    const currentCount =
      getGlobalStore(graph[0]).P.initialDataRefreshCount || 0;
    mergeVertexProperties<GlobalProperties>(
      0,
      "globalStoreId",
      graph[0],
      graph[1],
      {
        initialDataRefreshCount: currentCount + 1,
      },
    );
  };

  // Validation function using our utility
  const validateSignupData = (formData: Vertex) => {
    const isValid = validateFormData(formData, showErrorToast, {
      requireEmail: true,
      requirePassword: true,
      requireUsername: true,
    });

    if (isValid && formData.P.termsAgreement !== true) {
      showErrorToast("You must accept the Terms of Service to continue");
      return false;
    }

    return isValid;
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
      onSuccess: triggerRefresh,
    });
  };

  // Password field enter key handler
  const handlePasswordEnter = async (
    options: SignupFormFunctionArgumentType,
  ) => {
    try {
      options.contextData.submitState[1]("isLoading", true);
      const formData = options.data;
      await handleSubmit(formData);
    } finally {
      options.contextData.submitState[1]("isLoading", false);
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
      ...createFormHeader(
        "Create your account",
        "Welcome! Please fill in the details to get started.",
      ),
      {
        attributes: [
          {
            as: "div",
            attributes: [
              {
                as: "button",
                attributes: [
                  {
                    as: "icon",
                    componentName: "Html",
                    props: () => ({
                      height: 20,
                      icon: "logos:google-icon",
                      width: 20,
                    }),
                  },
                  {
                    as: "span",
                    componentName: "Html",
                    text: "Continue with Google",
                  },
                ],
                componentName: "Html",
                css: `return \`._id {
  width: 100%;
  padding: 0.75rem 1rem;
  background: white;
  color: #1f1f1f;
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.375rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
}
._id:hover {
  background: #f8f9fa;
  border-color: \${args.theme.var.color.border_dark_200};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
._id:active {
  background: #e9ecef;
}\`;`,
                props: () => ({
                  onClick: () => {
                    window.location.href = "/api/auth/google/signin";
                  },
                  type: "button",
                }),
              },
              {
                as: "div",
                attributes: [
                  {
                    as: "div",
                    componentName: "Html",
                    css: `return \`._id {
  flex: 1;
  height: 1px;
  background: \${args.theme.var.color.border};
}\`;`,
                  },
                  {
                    as: "span",
                    componentName: "Html",
                    css: `return \`._id {
  padding: 0 1rem;
  color: \${args.theme.var.color.text_dark_300};
  font-size: 0.875rem;
}\`;`,
                    text: "OR",
                  },
                  {
                    as: "div",
                    componentName: "Html",
                    css: `return \`._id {
  flex: 1;
  height: 1px;
  background: \${args.theme.var.color.border};
}\`;`,
                  },
                ],
                componentName: "Html",
                css: `return \`._id {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
}\`;`,
              },
            ],
            componentName: "Html",
            props: () => ({
              hide: () => !googleOAuthEnabled(),
            }),
          },
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
                  validate: validateUsername,
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
                    css: PROPERTIES.Css.TextFieldCss,
                    componentName: "SystemTextInput",
                    key: "password",
                    props: (options: SignupFormFunctionArgumentType) => ({
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
                          if (options.contextData.submitState[0]?.isLoading) {
                            return;
                          }
                          handlePasswordEnter(options);
                        }
                      },
                      onMount: (ref: HTMLInputElement) => {
                        setRef("passwordRef", ref);
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
                        componentName: "Html",
                        as: "icon",
                        props: () => ({
                          icon: showPassword.password
                            ? "ph:eye"
                            : "ph:eye-slash",
                          onClick: () => toggleVisibility("password"),
                        }),
                      },
                    ],
                    css: `return \`._id {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}\`;`,
                    componentName: "Html",
                  },
                ],
                css: `return \`._id {
  position: relative;
}\`;`,
                componentName: "Html",
              },
              getErrorSchema("password"),
              {
                as: "div",
                attributes: [
                  {
                    css: PROPERTIES.Css.CheckBoxCss,
                    componentName: "SystemTextInput",
                    key: "termsAgreement",
                    props: (options: FunctionArgumentType) => ({
                      onInput: (e: Event) => {
                        if (e.target instanceof HTMLInputElement) {
                          options.updateValue(e.target.checked);
                        }
                      },
                      type: "checkbox",
                      validation: {
                        required: true,
                      },
                    }),
                    validation: {
                      required: true,
                    },
                  },
                  {
                    as: "div",
                    componentName: "Html",
                    css: `return \`._id {
  margin-left: 8px;
  display: flex;
  align-items: center;
}\`;`,
                    attributes: [
                      {
                        as: "span",
                        componentName: "Html",
                        css: `return \`._id {
  color: \${args.theme.var.color.text};
}\`;`,
                        text: "I agree to the ",
                      },
                      {
                        as: "a",
                        componentName: "Html",
                        css: `return \`._id {
  color: \${args.theme.var.color.primary};
  cursor: pointer;
}\`;`,
                        props: () => ({
                          onClick: () => {
                            navigate("/terms");
                          },
                        }),
                        text: "Terms of Service",
                      },
                    ],
                  },
                ],
                css: `return \`._id {
  display: flex;
  align-items: center;
  margin: 16px 0;
}\`;`,
                componentName: "Html",
              },
              getErrorSchema("termsAgreement"),
              {
                as: "button",
                css: [
                  STYLES.button2Css,
                  "return `._id {width:100%; margin-top:16px;}`;",
                ],
                componentName: "Html",
                props: (options: SignupFormFunctionArgumentType) => ({
                  disabled: options.contextData.submitState[0]?.isLoading,
                  onClick: async () => {
                    try {
                      options.contextData.submitState[1]("isLoading", true);
                      await handleSubmit(options.data);
                    } finally {
                      options.contextData.submitState[1]("isLoading", false);
                    }
                  },
                  text: options.contextData.submitState[0]?.isLoading
                    ? "Signing up..."
                    : "Sign Up",
                }),
                type: "button",
              },
            ],
            componentName: "Html",
            contextName: "submitState",

            props: () => ({
              data: createStore<{ isLoading: boolean }>({
                isLoading: false,
              }),
            }),
          },

          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: `return \`._id {
  color: \${args.theme.var.color.text};
}\`;`,
                componentName: "Html",
                text: "Already have an account? ",
              },
              {
                as: "a",
                css: `return \`._id {
  color: \${args.theme.var.color.primary};
  cursor: pointer;
}\`;`,
                componentName: "Html",
                props: () => ({
                  onClick: () => {
                    navigate(API.urls.admin.signIn);
                  },
                }),
                text: "Sign in",
              },
            ],
            css: `return \`._id {
  text-align: center;
  margin-top: 16px;
  border-top: 1px solid \${args.theme.var.color.border};
  padding-top: 16px;
}\`;`,
            componentName: "Html",
          },
        ],
        css: SETTINGS_CONSTANTS.FORM_GRID_CSS,
        componentName: "Html",
      },
    ],
    componentName: "Html",
  };

  return (
    <SchemaRenderer
      form={{
        attributes: [
          {
            ...wrapFormInCard(form),
            fns: `
              let trap = null;

              const initializeFocusTrap = () => {
                const element = args.ref();
                if (!element) return;

                trap = args.focusTrap.createFocusTrap(element, {
                  initialFocus: () => document.getElementsByTagName("input")[0],
                  fallbackFocus: () => element,
                  escapeDeactivates: false,
                  allowOutsideClick: true,
                  returnFocusOnDeactivate: true,
                });

                trap.activate();
              };

              const cleanupFocusTrap = () => {
                if (trap) {
                  trap.deactivate();
                  trap = null;
                }
              };

              return {
                initializeFocusTrap,
                cleanupFocusTrap
              };
            `,
            props: (options: FunctionArgumentType) => ({
              onMount: () => {
                options.fns.initializeFocusTrap?.();
              },
              onCleanup: () => {
                options.fns.cleanupFocusTrap?.();
              },
            }),
          },
        ],
        key: "Signup",
      }}
    />
  );
}
