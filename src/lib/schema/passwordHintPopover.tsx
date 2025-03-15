import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

import {
  PASSWORD_CONDITIONS,
  validatePasswordConditions,
} from "../validation/validatePassword";
import { popoverWrapperSchema } from "./popoverWrapperSchema";

/**
 * Creates a popover content component that dynamically shows password validation status
 * @param passwordFieldKey The key of the password field to validate
 * @returns A field attribute for the popover content
 */
export function createPasswordHintPopoverContent(
  passwordFieldKey: string,
): FieldAttribute {
  return {
    as: "div",
    attributes: [
      {
        as: "h3",
        class: "font-size:16px color:primary m:0 mb:8",
        componentName: "Html",
        text: "Password Requirements",
      },
      {
        as: "ul",
        attributes: PASSWORD_CONDITIONS.map((condition, index) => ({
          as: "li",
          attributes: [
            {
              componentName: "Icon",
              props: (options: FunctionArgumentType) => {
                const validationState = options.dataContext.validationState;
                const isValid =
                  validationState?.[0]?.conditions?.[index]?.isValid;
                const fieldValue = options.data?.P?.[passwordFieldKey];
                const iconName = fieldValue
                  ? isValid
                    ? "ph:check-circle-fill"
                    : "ph:x-circle-fill"
                  : "ph:circle";
                const iconColor = fieldValue
                  ? isValid
                    ? "color:success"
                    : "color:danger"
                  : "color:grey";

                return {
                  class: iconColor,
                  icon: iconName,
                };
              },
            },
            {
              as: "span",
              componentName: "Html",
              props: (options: FunctionArgumentType) => {
                const validationState = options.dataContext.validationState;
                const isValid =
                  validationState?.[0]?.conditions?.[index]?.isValid;
                const fieldValue = options.data?.P?.[passwordFieldKey];
                const textColor = fieldValue
                  ? isValid
                    ? "color:success"
                    : "color:base-80"
                  : "color:base-80";

                return {
                  class: textColor,
                  text: condition.message,
                };
              },
            },
          ],
          class: "font-size:14px mb:4 d:flex align-items:center gap:8",
          componentName: "Html",
        })),
        class: "m:0 pl:16 list-style:none",
        componentName: "Html",
        props: (options: FunctionArgumentType) => {
          createEffect(() => {
            const password = options.data?.P?.[passwordFieldKey] || "";
            const conditions = validatePasswordConditions(password);
            const isValid = conditions.every((condition) => condition.isValid);
            const hasContent = password.length > 0;

            // Update validation state
            options.dataContext.validationState[1]("conditions", conditions);
            options.dataContext.validationState[1]("isValid", isValid);

            // Update help icon state
            if (options.dataContext.helpIconState) {
              options.dataContext.helpIconState[1]("isValid", isValid);
              options.dataContext.helpIconState[1]("hasContent", hasContent);
            }
          });

          return {};
        },
      },
    ],
    class: "p:12 bg:white shadow:lg r:4 max-width:300px",
    componentName: "Html",
  };
}

/**
 * Creates an action element with help icon for password field labels
 * @param label The label text for the password field
 * @returns A field attribute for the label with help icon
 */
export function createPasswordLabelWithHint(label: string): FieldAttribute {
  return {
    as: "div",
    attributes: [
      {
        attributes: [
          {
            as: "span",
            class: SETTINGS_CONSTANTS.LABEL_CLASS,
            componentName: "Html",
            text: label,
          },
          {
            componentName: "Icon",
            props: (options: FunctionArgumentType) => {
              const helpIconState = options.dataContext.helpIconState;
              const iconName = helpIconState?.[0]?.isValid
                ? "ph:check-circle"
                : helpIconState?.[0]?.hasContent
                  ? "ph:warning-circle"
                  : "ph:question-circle";
              const iconColor = helpIconState?.[0]?.isValid
                ? "color:success"
                : helpIconState?.[0]?.hasContent
                  ? "color:warning"
                  : "color:grey";

              return {
                class: iconColor,
                icon: iconName,
              };
            },
          },
        ],
        class: "d:flex gap:4 align-items:center",
        componentName: "Html",
      },
    ],
    componentName: "Data",
    name: "helpIconState",

    props: () => ({
      data: createStore({
        hasContent: false,
        isValid: false,
      }),
    }),
  };
}

/**
 * Wraps a password label with a popover that shows password validation hints
 * @param label The label text for the password field
 * @param passwordFieldKey The key of the password field to validate
 * @returns A field attribute with the label wrapped in a popover
 */
export function wrapPasswordLabelWithHint(
  label: string,
  passwordFieldKey: string,
): FieldAttribute {
  const actionElement = createPasswordLabelWithHint(label);
  const popoverContent = createPasswordHintPopoverContent(passwordFieldKey);

  return {
    as: "div",
    attributes: [
      {
        attributes: [popoverWrapperSchema(actionElement, popoverContent)],
        componentName: "Data",
        name: "validationState",

        props: () => ({
          data: createStore({
            conditions: PASSWORD_CONDITIONS.map((condition) => ({
              isValid: false,
              message: condition.message,
            })),
            isValid: false,
          }),
        }),
      },
    ],
    componentName: "Html",
  };
}
