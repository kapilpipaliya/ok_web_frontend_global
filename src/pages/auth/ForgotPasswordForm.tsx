import { useNavigate } from "@solidjs/router";
import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { useToast } from "~/components/styled/modal/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { getErrorSchema } from "~/lib/schema/getErrorSchema";
import { getPasswordLabelWithHintSchema } from "~/lib/schema/passwordHintPopover";
import { wrapFormInCard } from "~/lib/schema/wrapFormInCard";
import { validatePassword } from "~/lib/validation/validatePassword";

import { SchemaRenderer } from "../SchemaRenderer";
import { PROPERTIES, SETTINGS_CONSTANTS } from "../settings/constants";
import {
  createFormHeader,
  createFormSubmitButton,
  createLinkButton,
  createTextField,
} from "./functions/formComponents";
import { usePasswordVisibility } from "./functions/usePasswordVisibility";
import { css } from "~/lib/styles";

export function ForgotPasswordForm() {
  const navigate = useNavigate();
  const { showErrorToast, showSuccessToast } = useToast();

  const [showPassword, toggleVisibility] = usePasswordVisibility([
    "newPassword",
    "confirmPassword",
  ]);

  // Store user data and session data for the entire flow
  const [userState, setUserState] = createStore({
    email: "", // Keep email for display purposes only
    resetSessionToken: "",
    userUuid: "", // Store UUID instead of relying on email for identification
  });

  const handleIdentifierSubmit = async (options: FunctionArgumentType) => {
    const { identifier } = options.data?.P;
    if (!identifier?.trim()) {
      showErrorToast("Enter email or username");
      return;
    }

    try {
      // Send password reset request
      const result = await postAPI(API.auth.passwordReset.requestUrl, {
        identifier,
      });

      if (!result.success) {
        showErrorToast(result.message || "Failed to send reset email");
        return;
      }

      // Store the email for display purposes
      if (result.email) {
        setUserState("email", result.email);
      }

      // Store the UUID for secure identification in subsequent requests
      if (result.userUuid) {
        setUserState("userUuid", result.userUuid);

        // For additional security, store in sessionStorage (cleared when browser is closed)
        sessionStorage.setItem("resetUserUuid", result.userUuid);
      }

      // Store the session token for later verification steps
      if (result.resetSessionToken) {
        setUserState("resetSessionToken", result.resetSessionToken);

        // For additional security, store in sessionStorage (cleared when browser is closed)
        sessionStorage.setItem("resetSessionToken", result.resetSessionToken);
      }

      showSuccessToast("Reset instructions sent to your email");
      options.dataContext.stageData[1]("name", 1);
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    }
  };

  const handleOtpSubmit = async (options: FunctionArgumentType) => {
    const { otp } = options.data?.P;
    if (!otp?.trim()) {
      showErrorToast("Please enter OTP");
      return;
    }

    // Get user UUID and session token from state or session storage as fallback
    const userUuid =
      userState.userUuid || sessionStorage.getItem("resetUserUuid");
    const resetSessionToken =
      userState.resetSessionToken ||
      sessionStorage.getItem("resetSessionToken");

    if (!(userUuid && resetSessionToken)) {
      showErrorToast(
        "Session expired. Please restart the password reset process.",
      );
      return;
    }

    try {
      // Verify the OTP
      const result = await postAPI(API.auth.passwordReset.verifyOtpUrl, {
        otp,
        resetSessionToken,
        userUuid,
      });

      if (!result.success) {
        showErrorToast(result.message || "Invalid or expired OTP");
        return;
      }

      showSuccessToast("OTP verified successfully");
      options.dataContext.stageData[1]("name", 2);
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    }
  };

  const handlePasswordResetSubmit = async (options: FunctionArgumentType) => {
    const { confirmPassword, newPassword } = options.data?.P;

    if (newPassword !== confirmPassword) {
      showErrorToast("Passwords do not match");
      return false;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      showErrorToast(passwordError);
      return false;
    }

    // Get user UUID and session token from state or session storage as fallback
    const userUuid =
      userState.userUuid || sessionStorage.getItem("resetUserUuid");
    const resetSessionToken =
      userState.resetSessionToken ||
      sessionStorage.getItem("resetSessionToken");

    if (!(userUuid && resetSessionToken)) {
      showErrorToast(
        "Session expired. Please restart the password reset process.",
      );
      return false;
    }

    try {
      // Reset the password
      const result = await postAPI(API.auth.passwordReset.completeUrl, {
        newPassword,
        resetSessionToken,
        userUuid,
      });

      if (!result.success) {
        showErrorToast(result.message || "Failed to reset password");
        return false;
      }

      // Clear session storage
      sessionStorage.removeItem("resetUserUuid");
      sessionStorage.removeItem("resetSessionToken");

      showSuccessToast("Password has been reset successfully");

      // Redirect to login page after successful reset
      setTimeout(() => {
        navigate("/auth/login");
      }, 3000);

      return true;
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
      return false;
    }
  };

  // Step 1: Enter email/username
  const stepUserNameSchema: FieldAttribute = {
    as: "div",
    attributes: [
      ...createFormHeader("Reset Password"),
      {
        attributes: [
          ...createTextField(
            "identifier",
            "Email or Username",
            async (options: FunctionArgumentType) => {
              try {
                options.dataContext.submitState[1]("isLoading", true);
                await handleIdentifierSubmit(options);
              } finally {
                options.dataContext.submitState[1]("isLoading", false);
              }
            },
          ),
          createFormSubmitButton(
            (options) =>
              options.dataContext.submitState[0]?.isLoading
                ? "Sending..."
                : "Confirm",
            async (options) => {
              await handleIdentifierSubmit(options);
            },
          ),
          createLinkButton(
            () => "Back to Login",
            () => {
              navigate("/auth/login");
            },
          ),
        ],
        componentName: "Html",
      },
    ],
    componentName: "Html",
  };

  // Step 2: Enter OTP
  const stepOTPSchema: FieldAttribute = {
    as: "div",
    attributes: [
      ...createFormHeader("Verify OTP"),
      {
        attributes: [
          {
            as: "div",
            css: css`
  white-space: center;
  margin-bottom: 16px;
`,
            componentName: "Html",
            text: `We've sent a verification code to ${userState.email || "your email"}. Please enter it below.`,
          },
          ...createTextField(
            "otp",
            "One Time Password (OTP)",
            async (options: FunctionArgumentType) => {
              try {
                options.dataContext.submitState[1]("isLoading", true);
                await handleOtpSubmit(options);
              } finally {
                options.dataContext.submitState[1]("isLoading", false);
              }
            },
            undefined,
            {
              maxLength: 6,
              minLength: 6,
              required: true,
            },
          ),
          createFormSubmitButton(
            (options) =>
              options.dataContext.submitState[0]?.isLoading
                ? "Verifying..."
                : "Submit",
            async (options) => {
              await handleOtpSubmit(options);
            },
          ),
          createLinkButton(
            () => "Back to Previous Step",
            () => {
              options.dataContext.stageData[1]("name", 0);
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

  // Step 3: Enter new password
  const stepNewPasswordSchema: FieldAttribute = {
    as: "div",
    attributes: [
      ...createFormHeader("Set New Password"),
      {
        attributes: [
          // New password field
          getPasswordLabelWithHintSchema("New Password", "newPassword"),
          {
            as: "div",
            attributes: [
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "TextInput",
                key: "newPassword",
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
                      try {
                        options.dataContext.submitState[1]("isLoading", true);
                        await handlePasswordResetSubmit(options);
                      } finally {
                        options.dataContext.submitState[1]("isLoading", false);
                      }
                    }
                  },
                  type: showPassword.newPassword ? "text" : "password",
                }),
                validation: {
                  required: true,
                },
              },
              {
                as: "div",
                attributes: [
                  {
                    componentName: "Icon",
                    props: () => ({
                      icon: showPassword.newPassword
                        ? "ph:eye"
                        : "ph:eye-slash",
                      onClick: () => toggleVisibility("newPassword"),
                    }),
                  },
                ],
                css: css`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
`,
                componentName: "Html",
              },
            ],
            css: css`
  position: relative;
`,
            componentName: "Html",
          },
          getErrorSchema("newPassword"),

          // Confirm password field
          getPasswordLabelWithHintSchema("Confirm Password", "confirmPassword"),
          {
            as: "div",
            attributes: [
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "TextInput",
                key: "confirmPassword",
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
                      try {
                        options.dataContext.submitState[1]("isLoading", true);
                        await handlePasswordResetSubmit(options);
                      } finally {
                        options.dataContext.submitState[1]("isLoading", false);
                      }
                    }
                  },
                  type: showPassword.confirmPassword ? "text" : "password",
                }),
                validation: {
                  required: true,
                },
              },
              {
                as: "div",
                attributes: [
                  {
                    componentName: "Icon",
                    props: () => ({
                      icon: showPassword.confirmPassword
                        ? "ph:eye"
                        : "ph:eye-slash",
                      onClick: () => toggleVisibility("confirmPassword"),
                    }),
                  },
                ],
                css: css`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
`,
                componentName: "Html",
              },
            ],
            css: css`
  position: relative;
`,
            componentName: "Html",
          },
          getErrorSchema("confirmPassword"),

          createFormSubmitButton(
            (options) =>
              options.dataContext.submitState[0]?.isLoading
                ? "Resetting..."
                : "Reset Password",
            async (options) => {
              await handlePasswordResetSubmit(options);
            },
          ),
          createLinkButton(
            () => "Back to Previous Step",
            (options) => {
              options.dataContext.stageData[1]("name", 1);
            },
          ),
        ],
        css: SETTINGS_CONSTANTS.FORM_GRID_CSS,
        componentName: "Html",
      },
    ],
    css: SETTINGS_CONSTANTS.FORM_CSS,
    componentName: "Html",
  } as FieldAttribute;

  const form = {
    attributes: [
      {
        attributes: [
          {
            attributes: [
              {
                as: "",
                attributes: [stepUserNameSchema],
                componentName: "Html",
                props: (options: FunctionArgumentType) => ({
                  hide: options.dataContext.stageData?.[0]?.name !== 0,
                }),
              },
              {
                as: "",
                attributes: [stepOTPSchema],
                componentName: "Html",
                props: (options: FunctionArgumentType) => ({
                  hide: options.dataContext.stageData?.[0]?.name !== 1,
                }),
              },
              {
                as: "",
                attributes: [stepNewPasswordSchema],
                componentName: "Html",
                props: (options: FunctionArgumentType) => ({
                  hide: options.dataContext.stageData?.[0]?.name !== 2,
                }),
              },
            ],
            componentName: "Data",
            name: "stageData",

            props: () => ({
              data: createStore({
                name: 0, // Initial stage
              }),
            }),
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
      form={{ attributes: [wrapFormInCard(form)], key: "ForgotPassword" }}
    />
  );
}
