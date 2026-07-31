import { useNavigate, useSearchParams } from "@solidjs/router";
import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { useToast } from "~/components/styled/modal/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { wrapFormInCard } from "~/lib/schema/wrapFormInCard";
import { getErrorSchema } from "~/lib/schema/getErrorSchema";
import { getPasswordLabelWithHintSchema } from "~/lib/schema/passwordHintPopover";
import { validatePassword } from "~/lib/validation/validatePassword";

import { SchemaRenderer } from "../SchemaRenderer";
import { PROPERTIES, STYLES } from "../settings/constants";
import { useFormRefs } from "./functions/useFormRefs";
import { usePasswordVisibility } from "./functions/usePasswordVisibility";
import { createFormHeader } from "~/pages/auth/functions/schema/createFormHeader";
import { createPasswordField } from "~/pages/auth/functions/schema/createPasswordField";

interface SetPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

type SubmitStateStore = ReturnType<
  typeof createStore<{
    isLoading: boolean;
  }>
>;

interface SetPasswordFunctionArgumentType extends FunctionArgumentType {
  contextData: {
    submitState: SubmitStateStore;
    [key: string]: unknown;
  };
}

export function SetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showErrorToast, showSuccessToast } = useToast();

  const token = () => {
    const t = searchParams.token;
    if (t === undefined || t === null) {
      return "";
    }
    return Array.isArray(t) ? (t[0] ?? "") : String(t);
  };

  const searchParamString = (key: string) => {
    const v = searchParams[key as keyof typeof searchParams];
    if (v === undefined || v === null) {
      return "";
    }
    return (Array.isArray(v) ? (v[0] ?? "") : String(v)).trim();
  };

  const accountSummaryLine = () => {
    const username = searchParamString("username");
    const email = searchParamString("email");
    if (username && email) {
      return `Username: ${username} · ${email}`;
    }
    if (username) {
      return `Username: ${username}`;
    }
    if (email) {
      return `Email: ${email}`;
    }
    return "";
  };

  const [showPassword, toggleVisibility] = usePasswordVisibility([
    "newPassword",
    "confirmPassword",
  ]);
  const [formRefs, setRef] = useFormRefs(["confirmPasswordRef"]);

  const handleSetPassword = async (
    options: SetPasswordFunctionArgumentType,
  ) => {
    const inviteToken = token().trim();
    if (!inviteToken) {
      showErrorToast("Invalid or missing link");
      return;
    }

    const newPassword = options.data?.P?.newPassword;
    const confirmPassword = options.data?.P?.confirmPassword;

    if (newPassword !== confirmPassword) {
      showErrorToast("Passwords do not match");
      return;
    }

    const passwordError = validatePassword(newPassword as string);
    if (passwordError) {
      showErrorToast(passwordError);
      return;
    }

    try {
      const result = (await postAPI(API.auth.setPasswordUrl, {
        newPassword,
        token: inviteToken,
      })) as SetPasswordResponse;

      if (!result.success) {
        showErrorToast(result.message || "Could not set password");
        return;
      }

      showSuccessToast(result.message || "Password saved. You can sign in.");

      setTimeout(() => {
        const params = new URLSearchParams(
          searchParams as Record<string, string>,
        );
        params.delete("token");
        params.delete("username");
        params.delete("email");
        const qs = params.toString();
        navigate(`${API.urls.admin.signIn}${qs ? `?${qs}` : ""}`, {
          replace: true,
        });
      }, 2000);
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    }
  };

  const handleConfirmPasswordEnter = async (
    options: SetPasswordFunctionArgumentType,
  ) => {
    try {
      options.contextData.submitState[1]("isLoading", true);
      await handleSetPassword(options);
    } finally {
      options.contextData.submitState[1]("isLoading", false);
    }
  };

  const handleNewPasswordEnter = async (
    options: SetPasswordFunctionArgumentType,
  ) => {
    if (
      !options.data?.P?.confirmPassword?.trim() &&
      formRefs.confirmPasswordRef
    ) {
      formRefs.confirmPasswordRef.focus();
    } else {
      await handleConfirmPasswordEnter(options);
    }
  };

  const passwordFormSchema: FieldAttribute = {
    as: "div",
    attributes: [
      ...createFormHeader(
        "Set your password",
        "Choose a strong password, then continue to sign in.",
      ),
      {
        as: "p",
        componentName: "Html",
        css: `return \`._id {
  text-align: center;
  color: \${t.var.color.text_dark_400};
  font-size: 0.95rem;
  margin-top: 4px;
  margin-bottom: 4px;
}\`;`,
        props: () => ({
          hide: !accountSummaryLine(),
          text: accountSummaryLine(),
        }),
      },
      {
        attributes: [
          getPasswordLabelWithHintSchema("New password", "newPassword"),
          {
            as: "div",
            attributes: [
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "SystemTextInput",
                key: "newPassword",
                props: (options: SetPasswordFunctionArgumentType) => ({
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
                      await handleNewPasswordEnter(options);
                    }
                  },
                  type: showPassword.newPassword ? "text" : "password",
                }),
                validation: {
                  minLength: 8,
                  required: true,
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
                      icon: showPassword.newPassword
                        ? "ph:eye"
                        : "ph:eye-slash",
                      onClick: () => toggleVisibility("newPassword"),
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
          getErrorSchema("newPassword"),
          ...createPasswordField(
            "confirmPassword",
            "Confirm password",
            showPassword,
            toggleVisibility,
            handleConfirmPasswordEnter,
            (ref) => setRef("confirmPasswordRef", ref),
          ),
          {
            as: "button",
            css: [
              STYLES.button2Css,
              `return \`._id {
                    width: 100%;
                    margin-top: 12px;
                  }
                  ._id:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    background-color: \${t.var.color.border};
                  }\`;`,
            ],
            componentName: "Html",
            props: (options: SetPasswordFunctionArgumentType) => {
              const isEmpty = !(
                options.data?.P?.newPassword?.trim() &&
                options.data?.P?.confirmPassword?.trim()
              );
              const isLoading = options.contextData.submitState[0]?.isLoading;

              return {
                disabled: isLoading || isEmpty,
                onClick: async () => {
                  try {
                    options.contextData.submitState[1]("isLoading", true);
                    await handleSetPassword(options);
                  } finally {
                    options.contextData.submitState[1]("isLoading", false);
                  }
                },
                text: isLoading ? "Saving..." : "Set password",
              };
            },
            type: "button",
          },
          {
            as: "div",
            attributes: [
              {
                as: "a",
                css: `return \`._id {
  color: \${t.var.color.primary};
  cursor: pointer;
}\`;`,
                componentName: "Html",
                props: () => ({
                  onClick: () => {
                    const params = new URLSearchParams(
                      searchParams as Record<string, string>,
                    );
                    params.delete("token");
                    params.delete("username");
                    params.delete("email");
                    const queryString = params.toString();
                    navigate(
                      `${API.urls.admin.signIn}${queryString ? `?${queryString}` : ""}`,
                    );
                  },
                }),
                text: "Back to sign in",
              },
            ],
            css: `return \`._id {
  text-align: center;
  margin-top: 16px;
  border-top: 1px solid \${t.var.color.border};
  padding-top: 16px;
}\`;`,
            componentName: "Html",
          },
        ],
        componentName: "Html",
        contextName: "submitState",
        props: () => ({
          data: createStore({
            isLoading: false,
          }),
        }),
      },
    ],
    componentName: "Html",
  };

  const form = {
    attributes: [
      {
        attributes: [passwordFormSchema],
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

  const invalidLinkFormSchema: FieldAttribute = {
    as: "div",
    attributes: [
      ...createFormHeader(
        "Invalid link",
        "This password setup link is missing or invalid. Ask your admin for a new invitation or sign in if you already have a password.",
      ),
      {
        attributes: [
          {
            as: "a",
            css: `return \`._id {
  color: \${t.var.color.primary};
  cursor: pointer;
}\`;`,
            componentName: "Html",
            props: () => ({
              onClick: () => {
                const params = new URLSearchParams(
                  searchParams as Record<string, string>,
                );
                params.delete("token");
                params.delete("username");
                params.delete("email");
                const qs = params.toString();
                navigate(`${API.urls.admin.signIn}${qs ? `?${qs}` : ""}`, {
                  replace: true,
                });
              },
            }),
            text: "Sign in",
          },
        ],
        componentName: "Html",
        css: `return \`._id {
  text-align: center;
  margin-top: 16px;
  border-top: 1px solid \${t.var.color.border};
  padding-top: 16px;
}\`;`,
      },
    ],
    componentName: "Html",
  };

  const invalidLinkForm = {
    attributes: [
      {
        attributes: [invalidLinkFormSchema],
        componentName: "Html",
        contextName: "submitState",
        props: () => ({
          data: createStore({
            isLoading: false,
          }),
        }),
      },
    ],
    componentName: "Html",
    props: (options: FunctionArgumentType) => ({
      onCleanup: () => {
        options.revertTransactionUpToIndex(options.txnId, -1);
      },
    }),
  };

  const cardFocusTrapAttrs = {
    fns: `
              let trap = null;

              const initializeFocusTrap = () => {
                const element = _.ref();
                if (!element) return;

                trap = _.focusTrap.createFocusTrap(element, {
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
  };

  return (
    <>
      {token().trim() ? (
        <SchemaRenderer
          form={{
            attributes: [
              {
                ...wrapFormInCard(form),
                ...cardFocusTrapAttrs,
              },
            ],
            key: "SetPassword",
          }}
        />
      ) : (
        <SchemaRenderer
          form={{
            attributes: [
              {
                ...wrapFormInCard(invalidLinkForm),
                ...cardFocusTrapAttrs,
              },
            ],
            key: "SetPasswordInvalidLink",
          }}
        />
      )}
    </>
  );
}
