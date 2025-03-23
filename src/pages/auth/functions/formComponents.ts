import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

import { getErrorSchema } from "~/lib/schema/getErrorSchema";
import {
  PROPERTIES,
  SETTINGS_CONSTANTS,
  STYLES,
} from "~/pages/settings/constants";
import { getLogoSchema } from "~/routes/internal/page/(email)/baseEmailTemplate";

/**
 * Creates a form header with logo and title
 * @param title - Form title
 * @returns Form header schema
 */
export function createFormHeader(title: string) {
  return [
    getLogoSchema("grid place-items:center", "h:80px", "fg:base-20"),
    {
      as: "h1",
      class: SETTINGS_CONSTANTS.TITLE_CLASS,
      componentName: "Html",
      text: title,
    },
  ];
}

/**
 * Creates a form submit button with loading state
 * @param text - Button text
 * @param loadingText - Text to show when loading
 * @param onClick - Click handler
 * @returns Submit button schema
 */
export function createFormSubmitButton(
  text: (options: FunctionArgumentType) => string,
  onClick: (options: FunctionArgumentType) => Promise<void>,
) {
  return {
    as: "button",
    class: `${STYLES.button2} w:100% mt:16`,
    componentName: "Html",
    props: (options: FunctionArgumentType) => ({
      disabled: options.dataContext.submitState[0]?.isLoading,
      onClick: async () => {
        try {
          options.dataContext.submitState[1]("isLoading", true);
          await onClick(options);
        } finally {
          options.dataContext.submitState[1]("isLoading", false);
        }
      },
      text: text(options),
    }),
    type: "button",
  };
}

/**
 * Creates a link button
 * @param text - Button text
 * @param onClick - Click handler
 * @param className - Additional CSS classes
 * @returns Link button schema
 */
export function createLinkButton(
  text: (options: FunctionArgumentType) => string,
  onClick: (options: FunctionArgumentType) => Promise<void> | void,
  className = "text:center mt:16px",
) {
  return {
    as: "div",
    attributes: [
      {
        as: "a",
        class: "fg:primary-50 cursor:pointer",
        componentName: "Html",
        props: (options: FunctionArgumentType) => ({
          onClick: async () => {
            if (onClick) {
              await onClick(options);
            }
          },
          text: text(options),
        }),
      },
    ],
    class: className,
    componentName: "Html",
  };
}

/**
 * Creates a password field with visibility toggle
 * @param key - Field key
 * @param label - Field label
 * @param showPassword - Password visibility state
 * @param toggleVisibility - Function to toggle visibility
 * @param onEnterKeyHandler - Handler for Enter key press
 * @param setRef - Function to set input ref
 * @returns Password field schema
 */
export function createPasswordField(
  key: string,
  label: string,
  showPassword: Record<string, boolean>,
  toggleVisibility: (field: string) => void,
  onEnterKeyHandler?: (options: FunctionArgumentType) => void,
  setRef?: (ref: HTMLInputElement) => void,
) {
  return [
    {
      as: "div",
      class: `${SETTINGS_CONSTANTS.LABEL_CLASS} mt:5`,
      componentName: "Html",
      text: label,
    },
    {
      as: "div",
      attributes: [
        {
          class: PROPERTIES.Css.TextField,
          componentName: "TextInput",
          key,
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

                if (onEnterKeyHandler) {
                  onEnterKeyHandler(options);
                }
              }
            },
            onMount: () => {
              if (
                options.ref &&
                options.ref() instanceof HTMLInputElement &&
                setRef
              ) {
                setRef(options.ref());
              }
            },
            ref: setRef,
            type: showPassword[key] ? "text" : "password",
          }),
          validation: { required: true },
        },
        {
          as: "div",
          attributes: [
            {
              componentName: "Icon",
              props: () => ({
                icon: showPassword[key] ? "ph:eye" : "ph:eye-slash",
                onClick: () => toggleVisibility(key),
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
    getErrorSchema(key),
  ];
}

/**
 * Creates a submit button
 * @param text - Button text
 * @param isLoading - Loading state
 * @param onClick - Click handler
 * @returns Submit button schema
 */
export function createSubmitButton(
  text: string,
  isLoading: boolean,
  onClick: () => void,
) {
  return {
    as: "button",
    attributes: [
      {
        as: "span",
        componentName: "Html",
        text,
      },
    ],
    class: `${STYLES.button2} w:100%`,
    componentName: "Html",
    props: () => ({
      disabled: isLoading,
      onClick,
      type: "submit",
    }),
  };
}

/**
 * Creates a text area field
 * @param key - Field key
 * @param label - Field label
 * @param rows - Number of rows
 * @param validation - Validation options
 * @returns Text area field schema
 */
export function createTextAreaField(
  key: string,
  label: string,
  rows = 6,
  validation: Record<string, any> = { required: true },
) {
  return [
    {
      as: "div",
      class: `${SETTINGS_CONSTANTS.LABEL_CLASS} mt:5`,
      componentName: "Html",
      text: label,
    },
    {
      as: "div",
      attributes: [
        {
          class: PROPERTIES.Css.TextField,
          componentName: "TextArea",
          key,
          props: (options: FunctionArgumentType) => ({
            onChange: options.onChange,
            rows,
            value: options.value ?? "",
          }),
          validation,
        },
      ],
      componentName: "Html",
    },
    getErrorSchema(key),
  ];
}

/**
 * Creates a text input field
 * @param key - Field key
 * @param label - Field label
 * @param onEnterKeyHandler - Handler for Enter key press
 * @param setRef - Function to set input ref
 * @param validation - Validation options
 * @returns Text input field schema
 */
export function createTextField(
  key: string,
  label: string,
  onEnterKeyHandler?: (options: FunctionArgumentType) => void,
  setRef?: (ref: HTMLInputElement) => void,
  validation: Record<string, any> = { required: true },
) {
  return [
    {
      as: "div",
      class: `${SETTINGS_CONSTANTS.LABEL_CLASS} mt:5`,
      componentName: "Html",
      text: label,
    },
    {
      as: "div",
      attributes: [
        {
          class: PROPERTIES.Css.TextField,
          componentName: "TextInput",
          key,
          props: (options: FunctionArgumentType) => ({
            onKeyDown: async (e: KeyboardEvent) => {
              if (e.key === "Enter") {
                if (e.target instanceof HTMLInputElement) {
                  options.updateValue(e.target.value);
                }

                if (options.dataContext.submitState[0]?.isLoading) {
                  return;
                }

                if (onEnterKeyHandler) {
                  onEnterKeyHandler(options);
                }
              }
            },
            onMount: () => {
              if (
                options.ref &&
                options.ref() instanceof HTMLInputElement &&
                setRef
              ) {
                setRef(options.ref());
              }
            },
            ref: setRef,
          }),
          validation,
        },
      ],
      componentName: "Html",
    },
    getErrorSchema(key),
  ];
}
