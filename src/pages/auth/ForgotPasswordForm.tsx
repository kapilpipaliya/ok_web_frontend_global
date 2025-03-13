import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";
import { wrapPasswordLabelWithHint } from "~/lib/schema/passwordHintPopover";
import { wrapFormInCard } from "~/lib/schema/wrapFormInCard";
import { validatePassword } from "~/lib/validation/validatePassword";

import { SchemaRenderer } from "../SchemaRenderer";
import { PROPERTIES, SETTINGS_CONSTANTS } from "../settings/constants";
import { getTitleSchema } from "./functions/getTitleSchema";
import { getLogoSchema } from "~/routes/internal/page/(email)/BaseEmailTemplate";
import { getErrorSchema } from "~/lib/schema/getErrorSchema";

export function ForgotPasswordForm() {
  const { showErrorToast, showSuccessToast } = useToast();
  const [showPassword, setShowPassword] = createStore({
    confirmPassword: false,
    newPassword: false,
  });

  // Store user data and session data for the entire flow
  const [userState, setUserState] = createStore({
    email: "", // Keep email for display purposes only
    resetSessionToken: "",
    userUuid: "", // Store UUID instead of relying on email for identification
  });

  const handleIdentifierSubmit = async (options: FunctionArgumentType) => {
    const { identifier } = options.data.P;
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
    const { otp } = options.data.P;
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
    const { confirmPassword, newPassword } = options.data.P;

    if (newPassword !== confirmPassword) {
      showErrorToast("Passwords do not match");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      showErrorToast(passwordError);
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
      // Reset the password
      const result = await postAPI(API.auth.passwordReset.completeUrl, {
        newPassword,
        resetSessionToken,
        userUuid,
      });

      if (!result.success) {
        showErrorToast(result.message || "Failed to reset password");
        return;
      }

      // Clear session storage
      sessionStorage.removeItem("resetUserUuid");
      sessionStorage.removeItem("resetSessionToken");

      showSuccessToast("Password has been reset successfully");

      // Redirect to login page after successful reset
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 3000);
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    }
  };

  const stepUserNameSchema = {
    as: "div",
    attributes: [
      getLogoSchema("grid place-items:center", "h:80px", "fg:base-20"),
      getTitleSchema("Forgot Password"),
      {
        as: "h1",
        class: SETTINGS_CONSTANTS.TITLE_CLASS,
        as: "span", componentName: "Html",
        text: "Reset Password",
      },
      {
        as: "div",
        attributes: [
          {
            class: SETTINGS_CONSTANTS.LABEL_CLASS,
            as: "span", componentName: "Html",
            text: "Email or Username",
          },
          {
            as: "div",
            attributes: [
              {
                class: PROPERTIES.Css.TextField,
                componentName: "TextInput",
                key: "identifier",
                label: "Email or Username",
                props: (options: FunctionArgumentType) => ({
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
                        await handleIdentifierSubmit(options);
                      } finally {
                        options.dataContext.submitState[1]("isLoading", false);
                      }
                    }
                  },
                  onMount: () => {
                    if (options.ref && options.ref() instanceof HTMLInputElement) {
                      options.ref()?.focus();
                    }
                  },
                }),
                validation: { required: true },
              }
            ],
            componentName: "Html",
          },
          getErrorSchema("identifier"),
        ],
        class: SETTINGS_CONSTANTS.FORM_GRID_CLASS,
        componentName: "Html",
      },
      {
        attributes: [
          {
            as: "button",
            class:
              "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none mr:8 w:100%",
            componentName: "Html",
            props: (options: FunctionArgumentType) => ({
              disabled: options.dataContext.submitState[0]?.isLoading,
              onClick: async () => {
                try {
                  options.dataContext.submitState[1]("isLoading", true);
                  await handleIdentifierSubmit(options);
                } finally {
                  options.dataContext.submitState[1]("isLoading", false);
                }
              },
              text: options.dataContext.submitState[0]?.isLoading
                ? "Sending..."
                : "Confirm",
            }),
            type: "button",
          },
        ],
        componentName: "Fragment",
      },
    ],
    class: SETTINGS_CONSTANTS.FORM_CLASS,
    componentName: "Html",
  } as FieldAttribute;

  const stepOTPSchema = {
    as: "div",
    attributes: [
      {
        as: "div",
        attributes: [
          {
            class: SETTINGS_CONSTANTS.LABEL_CLASS,
            as: "span", componentName: "Html",
            text: "One Time Password (OTP)",
          },
          {
            as: "div",
            attributes: [
              {
                class: PROPERTIES.Css.TextField,
                componentName: "TextInput",
                key: "otp",
                props: (options: FunctionArgumentType) => ({
                  maxLength: 6,
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
                        await handleOtpSubmit(options);
                      } finally {
                        options.dataContext.submitState[1]("isLoading", false);
                      }
                    }
                  },
                }),
                validation: { required: true },
              }
            ],
            componentName: "Html",
          },
          getErrorSchema("otp"),
        ],
        class: SETTINGS_CONSTANTS.FORM_GRID_CLASS,
        componentName: "Html",
      },
      {
        attributes: [
          {
            as: "button",
            class:
              "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none mr:8 w:100%",
            componentName: "Html",
            props: (options: FunctionArgumentType) => ({
              disabled: options.dataContext.submitState[0]?.isLoading,
              onClick: async () => {
                try {
                  options.dataContext.submitState[1]("isLoading", true);
                  await handleOtpSubmit(options);
                } finally {
                  options.dataContext.submitState[1]("isLoading", false);
                }
              },
              text: options.dataContext.submitState[0]?.isLoading
                ? "Verifying..."
                : "Submit",
            }),
            type: "button",
          },
        ],
        componentName: "Fragment",
      },
    ],
    class: SETTINGS_CONSTANTS.FORM_CLASS,
    componentName: "Html",
  } as FieldAttribute;

  const stepNewPasswordSchema = {
    as: "div",
    attributes: [
      {
        as: "div",
        attributes: [
          wrapPasswordLabelWithHint("New Password", "newPassword"),
          {
            as: "div",
            attributes: [
              {
                class: PROPERTIES.Css.TextField,
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
                validation: { required: true },
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
                      onClick: () =>
                        setShowPassword(
                          "newPassword",
                          !showPassword.newPassword,
                        ),
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
          getErrorSchema("newPassword"),
        ],
        class: SETTINGS_CONSTANTS.FORM_GRID_CLASS,
        componentName: "Html",
      },
      {
        as: "div",
        attributes: [
          wrapPasswordLabelWithHint("Confirm Password", "confirmPassword"),
          {
            as: "div",
            attributes: [
              {
                class: PROPERTIES.Css.TextField,
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
                validation: { required: true },
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
                      onClick: () =>
                        setShowPassword(
                          "confirmPassword",
                          !showPassword.confirmPassword,
                        ),
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
          getErrorSchema("confirmPassword"),
        ],
        class: SETTINGS_CONSTANTS.FORM_GRID_CLASS,
        componentName: "Html",
      },
      {
        attributes: [
          {
            as: "button",
            class:
              "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none mr:8 w:100%",
            componentName: "Html",
            props: (options: FunctionArgumentType) => ({
              disabled: options.dataContext.submitState[0]?.isLoading,
              onClick: async () => {
                try {
                  options.dataContext.submitState[1]("isLoading", true);
                  await handlePasswordResetSubmit(options);
                } finally {
                  options.dataContext.submitState[1]("isLoading", false);
                }
              },
              text: options.dataContext.submitState[0]?.isLoading
                ? "Resetting..."
                : "Confirm",
            }),
            type: "button",
          },
        ],
        componentName: "Fragment",
      },
    ],
    class: SETTINGS_CONSTANTS.FORM_CLASS,
    componentName: "Html",
  } as FieldAttribute;

  const form = {
    attributes: [
      {
        attributes: [
          {
            attributes: [
              {
                attributes: [stepUserNameSchema],
                name: "Fragment",
                props: (options: FunctionArgumentType) => ({
                  hidden: options.dataContext.stageData?.[0]?.name !== 0,
                }),
              },
              {
                attributes: [stepOTPSchema],
                name: "Fragment",
                props: (options: FunctionArgumentType) => ({
                  hidden: options.dataContext.stageData?.[0]?.name !== 1,
                }),
              },
              {
                attributes: [stepNewPasswordSchema],
                name: "Fragment",
                props: (options: FunctionArgumentType) => ({
                  hidden: options.dataContext.stageData?.[0]?.name !== 2,
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
      {
        as: "div",
        attributes: [
          {
            class: "color:grey",
            as: "span", componentName: "Html",
            text: "Already have an account? ",
          },
          {
            as: "a",
            class: "color:primary text-decoration:none font-weight:bold",
            componentName: "Html",
            props: () => ({
              href: "/auth/login",
            }),
            text: "Sign In",
          },
        ],
        class: "text-align:center mt:16",
        componentName: "Html",
      },
      {
        as: "div",
        attributes: [
          {
            class: "color:grey",
            as: "span", componentName: "Html",
            text: "Don't have an account? ",
          },
          {
            as: "a",
            class: "color:primary text-decoration:none font-weight:bold",
            componentName: "Html",
            props: () => ({
              href: "/auth/signup",
            }),
            text: "Sign Up",
          },
        ],
        class: "text-align:center mt:8",
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
      form={{ attributes: [wrapFormInCard(form)], key: "ForgotPassword" }}
    />
  );
}
