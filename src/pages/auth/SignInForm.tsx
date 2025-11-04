import { useNavigate, createAsync, useSearchParams } from "@solidjs/router";
import { onMount, Show } from "solid-js";
import { createStore } from "solid-js/store";
import createFocusTrap from "solid-focus-trap";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { wrapFormInCard } from "~/lib/schema/wrapFormInCard";
import { getUserRPC } from "~/routes/api/auth/(user)/getUserRPC";

import { SchemaRenderer } from "../SchemaRenderer";
import { STYLES } from "../settings/constants";
import { useFormRefs } from "./functions/useFormRefs";
import { useFormSubmit } from "./functions/useFormSubmit";
import { usePasswordVisibility } from "./functions/usePasswordVisibility";
import { validateFormData } from "./functions/validateFormData";
import { createFormHeader } from "~/pages/auth/functions/schema/createFormHeader";
import { createPasswordField } from "~/pages/auth/functions/schema/createPasswordField";
import { createTextField } from "~/pages/auth/functions/schema/createTextField";
import type { Vertex } from "~/lib/graph/type/vertex";
import { isGoogleOAuthEnabled } from "~/pages/global/oauth/oauthServerFunctions";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { GlobalProperties } from "~/lib/graph/context/GlobalProperties";
import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";
import {getGlobalSettingVertex} from "~/lib/graph/get/sync/store/getGlobalSettingVertex";

// Define type for submitState store
type SubmitStateStore = ReturnType<
  typeof createStore<{
    isLoading: boolean;
  }>
>;

// Define a type for function arguments with submitState in contextData
interface SignInFormFunctionArgumentType extends FunctionArgumentType {
  contextData: {
    submitState: SubmitStateStore;
    [key: string]: unknown;
  };
}

export function SignInForm() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const graph = useGraph();

  // Check if Google OAuth is enabled
  const googleOAuthEnabled = createAsync(async () => {
    const response = await isGoogleOAuthEnabled();
    return response.result || false;
  });

  // Check if user is already logged in
  const authData = createAsync(async () => {
    try {
      const userData = await getUserRPC();
      if (userData?.user && !userData.error) {
        // User is logged in, redirect them
        // Use redirectUrl from query params if present, otherwise use the one from getUserRPC
        const redirectUrl = searchParams.redirectUrl || userData.user.P.redirectUrl;

        navigate(redirectUrl, { replace: true });
        return userData;
      }
      return null;
    } catch {
      return null;
    }
  }, { deferStream: true });

  // Use our utility hooks
  const [showPassword, toggleVisibility] = usePasswordVisibility(["password"]);
  const [formRefs, setRef] = useFormRefs(["emailRef", "passwordRef"]);
  const { showErrorToast, submitForm } = useFormSubmit();

  // Function to trigger refresh of initial data
  const triggerRefresh = () => {
    const currentCount = getGlobalStore(graph[0]).P.initialDataRefreshCount || 0;
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

  onMount(() => {
    if (searchParams.error) {
      showErrorToast(searchParams.error as string);
      setSearchParams({ error: null }, { replace: true });
    }
    if (searchParams.message) {
      const type = searchParams.type || "info";
      if (type === "success") {
        // Don't show toast for success messages as they'll be shown in the alert
      } else if (type === "error") {
        // Don't show toast for error messages as they'll be shown in the alert
      }
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
        postAPI(API.auth.signInUrl, {
          email: data.P.email.toLowerCase(),
          password: data.P.password,
        }),
      loadMessage: "Logging In...",
      navigate,
      shouldRedirect: true,
      successMessage: "Logged In Successfully",
      validateFn: validateLoginData,
      onSuccess: triggerRefresh,
    });
  };

  // Password field enter key handler
  const handlePasswordEnter = async (
    options: SignInFormFunctionArgumentType,
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
  const handleEmailEnter = (options: SignInFormFunctionArgumentType) => {
    // Focus password field if empty
    if (!options.data?.P.password && formRefs.passwordRef) {
      formRefs.passwordRef.focus();
    } else {
      handlePasswordEnter(options);
    }
  };

  const form = {
    as: "div",
    attributes: [
      // Alert message component
      {
        as: "div",
        attributes: [
          {
            as: "icon",
            componentName: "Html",
            props: () => {
              const type = searchParams.type || "info";
              return {
                height: 20,
                icon:
                  type === "success"
                    ? "ph:check-circle"
                    : type === "error"
                      ? "ph:warning-circle"
                      : "ph:info",
                width: 20,
              };
            },
          },
          {
            as: "span",
            componentName: "Html",
            props: () => ({
              text: searchParams.message || "",
            }),
          },
          {
            as: "button",
            componentName: "Html",
            css: `return \`._id {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.2s;
}
._id:hover {
  opacity: 1;
}\`;`,
            props: () => ({
              onClick: () => {
                setSearchParams(
                  { message: null, type: null },
                  { replace: true },
                );
              },
            }),
            attributes: [
              {
                as: "icon",
                componentName: "Html",
                props: () => ({
                  height: 16,
                  icon: "ph:x",
                  width: 16,
                }),
              },
            ],
          },
        ],
        componentName: "Html",
        css: `return \`._id {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  width: 100%;
  background: \${
    (args.searchParams?.type || "info") === "success"
      ? args.theme.var.color.success_light_900
      : (args.searchParams?.type || "info") === "error"
        ? args.theme.var.color.error_light_900
        : args.theme.var.color.info_light_900
  };
  color: \${
    (args.searchParams?.type || "info") === "success"
      ? args.theme.var.color.success_dark_300
      : (args.searchParams?.type || "info") === "error"
        ? args.theme.var.color.error_dark_300
        : args.theme.var.color.info_dark_300
  };
  border: 1px solid \${
    (args.searchParams?.type || "info") === "success"
      ? args.theme.var.color.success_light_700
      : (args.searchParams?.type || "info") === "error"
        ? args.theme.var.color.error_light_700
        : args.theme.var.color.info_light_700
  };
  margin-bottom: 1.5rem;
}\`;`,
        props: () => ({
          hide: !searchParams.message,
        }),
      },
      // Use our utility for form header
      ...createFormHeader(
        `Sign in to ${getGlobalSettingVertex(graph[0])?.P.appName}`,
        "Welcome back! Please sign in to continue",
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
                    css: `return \`._id {
  color: \${args.theme.var.color.primary};
  font-size: 14px;
  cursor: pointer;
}\`;`,
                    componentName: "Html",
                    props: () => ({
                      onClick: () => {
                        navigate(API.urls.user.forgotPassword);
                      },
                    }),
                    text: "Forgot Password?",
                  },
                  {
                    as: "a",
                    css: `return \`._id {
  color: \${args.theme.var.color.primary};
  font-size: 14px;
  cursor: pointer;
}\`;`,
                    componentName: "Html",
                    props: () => ({
                      onClick: () => {
                        navigate(API.urls.user.resendVerification);
                      },
                    }),
                    text: "Resend Verification",
                  },
                ],
                css: `return \`._id {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}\`;`,
                componentName: "Html",
              },
              {
                as: "button",
                css: [
                  STYLES.button2Css,
                  `return \`._id {
                    width: 100%;
                  }
                  ._id:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    background-color: \${args.theme.var.color.border};
                  }\`;`,
                ],
                componentName: "Html",
                props: (options: SignInFormFunctionArgumentType) => {
                  const isFormEmpty =
                    !options.data?.P?.email?.trim() ||
                    !options.data?.P?.password?.trim();
                  const isLoading =
                    options.contextData.submitState[0]?.isLoading;

                  return {
                    disabled: isLoading || isFormEmpty,
                    onClick: async () => {
                      try {
                        options.contextData.submitState[1]("isLoading", true);
                        await handleSubmit(options.data);
                      } finally {
                        options.contextData.submitState[1]("isLoading", false);
                      }
                    },
                    text: isLoading ? "Logging in..." : "Log In",
                  };
                },
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
                text: "Don't have an account? ",
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
                    navigate("/auth/signup");
                  },
                }),
                text: "Sign Up",
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
        componentName: "Html",
      },
    ],
    componentName: "Html",
    props: (options: FunctionArgumentType) => ({
      onCleanup: () => {
        options.revertTransactionUpToIndex(options.txnId, -1);
      },
    }),
  };

  return (
    <Show when={authData() === null}>
      <SchemaRenderer
        form={{
          attributes: [
            {
              ...wrapFormInCard(form),
              props: (options: FunctionArgumentType) => ({
                beforeMount: () => {
                  createFocusTrap({
                    element: options.ref,
                    observeChanges: true,
                    restoreFocus: true,
                    initialFocusElement: () =>
                      document.getElementsByTagName("input")[0],
                  });
                },
              }),
            },
          ],
          key: "Login",
        }}
      />
    </Show>
  );
}
