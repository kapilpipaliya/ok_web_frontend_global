import { useNavigate } from "@solidjs/router";
import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { useToast } from "~/components/styled/modal/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { wrapFormInCard } from "~/lib/schema/wrapFormInCard";

import { SchemaRenderer } from "../SchemaRenderer";
import { SETTINGS_CONSTANTS } from "../settings/constants";
import { createFormHeader } from "~/pages/auth/functions/schema/createFormHeader";
import { createFormSubmitButton } from "~/pages/auth/functions/schema/createFormSubmitButton";
import { createLinkButton } from "~/pages/auth/functions/schema/createLinkButton";
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
          navigate(API.urls.admin.signIn);
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
            "Email or Username",
            async (options: ResendVerificationFunctionArgumentType) => {
              try {
                options.contextData.submitState[1]("isLoading", true);
                await handleSubmit(options);
              } finally {
                options.contextData.submitState[1]("isLoading", false);
              }
            },
            undefined,
            {
              required: true,
            },
          ),
          createFormSubmitButton(
            (options: ResendVerificationFunctionArgumentType) =>
              options.contextData.submitState[0]?.isLoading
                ? "Sending..."
                : "Send Verification Email",
            async (options: ResendVerificationFunctionArgumentType) => {
              try {
                options.contextData.submitState[1]("isLoading", true);
                await handleSubmit(options);
              } finally {
                options.contextData.submitState[1]("isLoading", false);
              }
            },
          ),
          createLinkButton(
            () => "Back to Sign In",
            () => {
              navigate(API.urls.admin.signIn);
            },
          ),
        ],
        css: SETTINGS_CONSTANTS.FORM_GRID_CSS,
        componentName: "Html",
      },
    ],
    css: SETTINGS_CONSTANTS.FORM_CSS,
    componentName: "Html",
  };

  const form = {
    attributes: [
      {
        attributes: [formSchema],
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
