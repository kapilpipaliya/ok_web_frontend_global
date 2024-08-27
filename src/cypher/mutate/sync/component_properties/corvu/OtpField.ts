export const OtpField = [
  {
    "componentName": "number",
    "default": "-",
    "description": "Max number of chars. Is required.",
    "name": "maxLength",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The value of the OTP Field.",
    "name": "value",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "(value: string) => void",
    "default": "-",
    "description": "Callback fired when the OTP Field value changes.",
    "name": "onValueChange",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "(value: string) => void",
    "default": "-",
    "description": "Callback fired when the OTP Field is filled.",
    "name": "onComplete",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether to create extra space on the right for password managers.",
    "name": "shiftPWManagers",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the OTP Field context. Useful if you have nested OTP Fields and want to create components that belong to an OTP Field higher up in the tree.",
    "name": "contextId",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "ValidComponent",
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "name": "as",
    "corvu": true,
    "hashName": "Root"
  }
];

export const OtpFieldInput = [
  {
    "componentName": "string | null",
    "default": "'^\\\\d*$'",
    "description": "Regex pattern for the input. null disables the pattern and allow all chars.",
    "name": "pattern",
    "corvu": true,
    "hashName": "Input"
  },
  {
    "componentName": "string | null",
    "default": "-",
    "description": "Override the styles to apply when JavaScript is disabled. corvu provides a default for this but you're free to define your own styling. null disables the fallback.",
    "name": "noScriptCSSFallback",
    "corvu": true,
    "hashName": "Input"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the OTP Field context. Useful if you have nested OTP Fields and want to create components that belong to an OTP Field higher up in the tree.",
    "name": "contextId",
    "corvu": true,
    "hashName": "Input"
  },
  {
    "componentName": "ValidComponent",
    "default": "input",
    "description": "Component to render the dynamic component as.",
    "name": "as",
    "corvu": true,
    "hashName": "Input"
  }
];