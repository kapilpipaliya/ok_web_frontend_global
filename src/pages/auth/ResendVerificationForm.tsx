import { useNavigate, useSearchParams } from "@solidjs/router";
import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { useToast } from "~/components/styled/modal/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { wrapFormInCard } from "~/lib/schema/wrapFormInCard";

import { SchemaRenderer } from "../SchemaRenderer";
import { STYLES } from "../settings/constants";
import { createFormHeader } from "~/pages/auth/functions/schema/createFormHeader";
import { createTextField } from "~/pages/auth/functions/schema/createTextField";

// Define type for submitState store
type SubmitStateStore = ReturnType<
  typeof createStore<{
    isLoading: boolean;
  }>
>;

// Define a type for function arguments with submitState in contextData
interface ResendVerificationFunctionArgumentType extends FunctionArgumentType {
  contextData: {
    submitState: SubmitStateStore;
    [key: string]: unknown;
  };
}

export function ResendVerificationForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showErrorToast, showSuccessToast } = useToast();

  const handleSubmit = async (
    options: ResendVerificationFunctionArgumentType,
  ) => {
    const identifier = options.data?.P?.identifier;
    if (!identifier?.trim()) {
      showErrorToast("Please enter your email or username");
      return;
    }

    try {
      const response = await postAPI(API.auth.resendVerificationUrl, {
        identifier: identifier.trim().toLowerCase(),
      });

      if (response.success) {
        showSuccessToast(
          response.message ||
            "If an account with this email or username exists and is not verified, a confirmation email has been sent.",
        );

        // Redirect to sign in after 3 seconds
        setTimeout(() => {
          const params = new URLSearchParams(
            searchParams as Record<string, string>,
          );
          const queryString = params.toString();
          navigate(
            `${API.urls.admin.signIn}${queryString ? `?${queryString}` : ""}`,
          );
        }, 3000);
      } else {
        showErrorToast(response.error || "Failed to send verification email");
      }
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    }
  };

  const handleIdentifierEnter = async (
    options: ResendVerificationFunctionArgumentType,
  ) => {
    if (options.contextData.submitState[0]?.isLoading) {
      return;
    }
    try {
      options.contextData.submitState[1]("isLoading", true);
      await handleSubmit(options);
    } finally {
      options.contextData.submitState[1]("isLoading", false);
    }
  };

  const formSchema: FieldAttribute = {
    as: "div",
    attributes: [
      ...createFormHeader(
        "Resend Verification Email",
        "Enter your email or username to receive a new verification link",
      ),
      {
        attributes: [
          ...createTextField(
            "identifier",
            "Username/Email",
            handleIdentifierEnter,
            undefined,
            {
              required: true,
            },
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
                    background-color: \${args.theme.var.color.border};
                  }\`;`,
            ],
            componentName: "Html",
            props: (options: ResendVerificationFunctionArgumentType) => {
              const isEmpty = !options.data?.P?.identifier?.trim();
              const isLoading =
                options.contextData.submitState[0]?.isLoading;

              return {
                disabled: isLoading || isEmpty,
                onClick: async () => {
                  try {
                    options.contextData.submitState[1]("isLoading", true);
                    await handleSubmit(options);
                  } finally {
                    options.contextData.submitState[1]("isLoading", false);
                  }
                },
                text: isLoading ? "Sending..." : "Send Verification Email",
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
  color: \${args.theme.var.color.primary};
  font-size: 14px;
  cursor: pointer;
}\`;`,
                componentName: "Html",
                props: () => ({
                  onClick: () => {
                    const params = new URLSearchParams(
                      searchParams as Record<string, string>,
                    );
                    const queryString = params.toString();
                    navigate(
                      `${API.urls.admin.signIn}${queryString ? `?${queryString}` : ""}`,
                    );
                  },
                }),
                text: "Back to Sign In",
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
        attributes: [formSchema],
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
        key: "ResendVerification",
      }}
    />
  );
}
